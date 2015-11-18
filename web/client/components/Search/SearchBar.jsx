/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {Input, Glyphicon, Button} = require('react-bootstrap');


var delay = (
    function() {
        var timer = 0;
        return function(callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
    })();

require('./searchbar.css');
/**
 * Search Bar component. With AutoComplete
 */
let SearchBar = React.createClass({
    propTypes: {
        onSearch: React.PropTypes.func,
        onSearchReset: React.PropTypes.func,
        delay: React.PropTypes.number,
        hideOnBlur: React.PropTypes.bool,
        blurResetDelay: React.PropTypes.number,
        typeAhead: React.PropTypes.bool
    },
    getDefaultProps() {
        return {
            onSearch: () => {},
            onSearchReset: () => {},
            delay: 1000,
            blurResetDelay: 300,
            hideOnBlur: true,
            typeAhead: true

        };
    },
    getInitialState() {
        return {
            searchText: ""
            };
    },
    onChange() {
        var text = this.refs.input.getValue();
        this.setState({searchText: text});
        if (this.props.typeAhead) {
            delay(() => {this.search(); }, this.props.delay);
        }
    },
    onKeyDown(event) {
        if (event.keyCode === 13) {
            this.search();
        }
    },
    onFocus() {
        this.search();
    },
    onBlur() {
        // delay this to make the click on result run anyway
        if (this.props.hideOnBlur) {
            delay(() => {this.props.onSearchReset(); }, this.props.blurResetDelay);
        }
    },
    render() {
        const innerGlyphicon = <Button onClick={this.search}><Glyphicon glyph="search"/></Button>;
        const remove = <Glyphicon className="searchclear" glyph="remove" onClick={this.clearSearch}/>;
        var showRemove = this.state.searchText !== "";
        return (
            <div className="MapSearchBar">
                <Input
                    type="text"
                    value={this.state.searchText}
                    ref="input"
                    addonAfter={showRemove ? remove : null}
                    buttonAfter={innerGlyphicon}
                    onKeyDown={this.onKeyDown}
                    onBlur={this.onBlur}
                    onFocus={this.onFocus}
                    onChange={this.onChange} />
            </div>
        );
    },
    search() {
        var text = this.refs.input.getValue();
        if (text === undefined || text === "") {
            this.props.onSearchReset();
            this.setState({searchText: text });
        } else {
            this.props.onSearch(text);
            this.setState({searchText: text });
        }

    },

    clearSearch() {
        this.setState({ searchText: ""});
        this.props.onSearchReset();
    }
});

module.exports = SearchBar;