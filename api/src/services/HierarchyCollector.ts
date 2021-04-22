import Fedora from "./Fedora";
import FedoraData from "../models/FedoraData";
import { DOMParser } from "xmldom";
const xpath = require("xpath");

class HierarchyCollector {
    fedora: Fedora;
    // PIDs that define the top of a hierarchy. Typically this
    // includes the overall top PID, plus the top public PID.
    hierarchyTops: Array<string>;

    constructor(fedora: Fedora, hierarchyTops: Array<string>) {
        this.fedora = fedora;
        this.hierarchyTops = hierarchyTops;
    }

    protected extractMetadata(DC: any): {[key: string]: Array<string>} {
        let metadata: {[key: string]: Array<string>} = {};
        DC.children.forEach((field) => {
            if (typeof metadata[field.name] === "undefined") {
                metadata[field.name] = [];
            }
            metadata[field.name].push(field.value);
        });
        return metadata;
    }

    protected extractRelations(RELS: string): {[key: string]: Array<string>} {
        let xmlParser = new DOMParser();
        let RELS_XML = xmlParser.parseFromString(RELS, "text/xml");
        let rdfXPath = xpath.useNamespaces({
            rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        });
        let relations: {[key: string]: Array<string>} = {};
        rdfXPath(
            '//rdf:Description/*', RELS_XML
        ).forEach((relation) => {
            let values = rdfXPath('text()', relation);
            // If there's a namespace on the node name, strip it:
            let nodeName = relation.nodeName.split(':').pop();
            if (values.length === 0) {
                values = rdfXPath('./@rdf:resource', relation);
            }
            if (values.length > 0) {
                if (typeof relations[nodeName] === "undefined") {
                    relations[nodeName] = [];
                }
                relations[nodeName].push(values[0].nodeValue);
            }
        });
        return relations;
    }

    async getHierarchy(pid): Promise<FedoraData> {
        try {
            // Use Fedora to get data
            const [DC, RELS] = await Promise.all([
                this.fedora.getDC(pid),
                this.fedora.getDatastream(pid, "RELS-EXT")
            ]);
            let result = new FedoraData(
                pid, this.extractRelations(RELS), this.extractMetadata(DC)
            );
            // Create promises to retrieve parents asynchronously...
            let promises = (result.relations.isMemberOf ?? [])
                .map(async (resource) => {
                    let parentPid = resource.substr("info:fedora/".length);
                    if (!this.hierarchyTops.includes(parentPid)) {
                        let parent = await this.getHierarchy(parentPid);
                        result.addParent(parent);
                    }
                });
            // Now wait for the promises to complete before we return results, so
            // nothing happens out of order.
            await Promise.all(promises);
            // TODO: catch failure
            return result;
        } catch(e) {
            return Promise.reject(e);
        }
    }
}

export default HierarchyCollector;