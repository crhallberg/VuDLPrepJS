import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import ChildList from "./ChildList";

import "remixicon/fonts/remixicon.css";

class ChildListItem extends React.Component {
    static propTypes = {
        pid: PropTypes.string,
        title: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = { open: false };
        this.toggle = this.toggle.bind(this);
    }

    toggle(e) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ open: !this.state.open });
    }

    render() {
        return (
            <div className="orbeon__child-list-item">
                <div className="orbeon__list-item-metadata">
                    <button className="orbean__child-toggle" onClick={this.toggle}>
                        {this.state.open ? (
                            <i className="ri-checkbox-indeterminate-line"></i>
                        ) : (
                            <i className="ri-add-box-fill"></i>
                        )}
                    </button>{" "}
                    <button className="orbean__gear-btn">
                        <i className="ri-folder-5-fill"></i>
                        <i className="ri-settings-5-fill"></i>
                    </button>
                    <Link to={`/editor/object/${this.props.pid}`} className="orbean__child-title">
                        {this.props.title}
                    </Link>
                    <div className="orbeon__list-item-status">TODO: status</div>
                </div>
                {this.state.open && <ChildList parent={this.props.pid} />}
            </div>
        );
    }
}

export default ChildListItem;