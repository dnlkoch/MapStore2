/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');

const Identify = require('../Identify.jsx');

const expect = require('expect');

describe('Identify', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the Identify component with defaults', () => {
        const identify = ReactDOM.render(
            <Identify/>,
            document.getElementById("container")
        );

        expect(identify).toExist();
    });

    it('creates the Identify component with available requests', () => {
        const identify = ReactDOM.render(
            <Identify requests={[{}]}/>,
            document.getElementById("container")
        );

        expect(identify).toExist();
        const dom = ReactDOM.findDOMNode(identify);
        expect(dom.parentNode.getElementsByClassName('panel').length).toBe(1);
    });

    it('creates the Identify component with missing responses', () => {
        const identify = ReactDOM.render(
            <Identify requests={[{}]}/>,
            document.getElementById("container")
        );

        expect(identify).toExist();
        const dom = ReactDOM.findDOMNode(identify);
        expect(dom.getElementsByClassName('spinner').length).toBe(1);
    });

    it('creates the Identify component with no missing responses', () => {
        const identify = ReactDOM.render(
            <Identify requests={[{}]} responses={[{}]}/>,
            document.getElementById("container")
        );

        expect(identify).toExist();
        const dom = ReactDOM.findDOMNode(identify);
        expect(dom.getElementsByClassName('spinner').length).toBe(0);
    });

    it('creates the Identify component changes mousepointer on enable / disable', () => {

        const testHandlers = {
            changeMousePointer: () => {}
        };

        const spyMousePointer = expect.spyOn(testHandlers, 'changeMousePointer');

        const identify = ReactDOM.render(
            <Identify changeMousePointer={testHandlers.changeMousePointer}/>,
            document.getElementById("container")
        );
        identify.setProps({enabled: true});
        expect(spyMousePointer.calls.length).toEqual(1);
        identify.setProps({enabled: false});
        expect(spyMousePointer.calls.length).toEqual(2);
    });

    it('creates the Identify component sends requests on point', () => {
        const testHandlers = {
            sendRequest: () => {}
        };

        const spySendRequest = expect.spyOn(testHandlers, 'sendRequest');

        const identify = ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                enabled={true} layers={[{}, {}]} sendRequest={testHandlers.sendRequest} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        identify.setProps({point: {pixel: {x: 1, y: 1}}});
        expect(spySendRequest.calls.length).toEqual(2);
    });

    it('creates the Identify component does not send requests on point if disabled', () => {
        const testHandlers = {
            sendRequest: () => {}
        };

        const spySendRequest = expect.spyOn(testHandlers, 'sendRequest');

        const identify = ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                enabled={false} layers={[{}, {}]} sendRequest={testHandlers.sendRequest} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        identify.setProps({point: {pixel: {x: 1, y: 1}}});
        expect(spySendRequest.calls.length).toEqual(0);
    });

    it('creates the Identify component filters layers', () => {
        const testHandlers = {
            sendRequest: () => {}
        };

        const spySendRequest = expect.spyOn(testHandlers, 'sendRequest');

        const identify = ReactDOM.render(
            <Identify
                queryableLayersFilter={(layer) => layer.type === "wms"}
                enabled={true} layers={[{type: "wms"}, {type: "osm"}]} sendRequest={testHandlers.sendRequest} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        identify.setProps({point: {pixel: {x: 1, y: 1}}});
        expect(spySendRequest.calls.length).toEqual(1);
    });

    it('creates the Identify component shows marker on point', () => {
        const testHandlers = {
            showMarker: () => {},
            hideMarker: () => {}
        };

        const spyShowMarker = expect.spyOn(testHandlers, 'showMarker');
        const spyHideMarker = expect.spyOn(testHandlers, 'hideMarker');

        const identify = ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                enabled={true} layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        identify.setProps({point: {pixel: {x: 1, y: 1}}});
        expect(spyShowMarker.calls.length).toEqual(1);
        identify.setProps({enabled: false});
        expect(spyHideMarker.calls.length).toEqual(1);
    });

    it('creates the Identify component purge results on point', () => {
        const testHandlers = {
            purgeResults: () => {}
        };

        const spyPurgeResults = expect.spyOn(testHandlers, 'purgeResults');

        const identify = ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                enabled={true} layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        identify.setProps({point: {pixel: {x: 1, y: 1}}});
        expect(spyPurgeResults.calls.length).toEqual(1);
        identify.setProps({enabled: false});
        expect(spyPurgeResults.calls.length).toEqual(2);
    });

    it('creates the Identify component uses custom viewer', () => {
        const Viewer = (props) => <span className="myviewer">{props.responses.length}</span>;
        const identify = ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                viewer={Viewer}
                requests={[{}]}
                enabled={true} layers={[{}, {}]} responses={[{}, {}]} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        const dom = ReactDOM.findDOMNode(identify);
        const viewer = dom.getElementsByClassName("myviewer");
        expect(viewer.length).toBe(1);
        expect(viewer[0].innerHTML).toBe('2');
    });
});
