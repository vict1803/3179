"""Add agreement colours and connection highlighting to the alluvial specification.
Called by build_specs.py; running this file updates only chart 12.
The source cross-classification and band geometry are retained.
"""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
SAME = '#5261a6'
DIFFERENT = '#c65c86'


def enhance_alluvial(spec):
    spec['signals'] = [
        {'name': 'lx', 'update': "width * (width < 420 ? 0.26 : 0.18)"},
        {'name': 'rx', 'update': "width * (width < 420 ? 0.74 : 0.82)"},
        {'name': 'selectedNode', 'value': None, 'on': [
            {'events': '@categoryNodes:click, @categoryLabels:click',
             'update': "selectedNode && selectedNode.side == datum.side && selectedNode.label == datum.label ? null : {side: datum.side, label: datum.label}"}]},
        {'name': 'hoverNode', 'value': None, 'on': [
            {'events': '@categoryNodes:pointerover, @categoryLabels:pointerover',
             'update': '{side: datum.side, label: datum.label}'},
            {'events': '@categoryNodes:pointerout, @categoryLabels:pointerout', 'update': 'null'}]},
        {'name': 'hoverLink', 'value': None, 'on': [
            {'events': '@flowBands:pointerover', 'update': '{a: datum.a, b: datum.b}'},
            {'events': '@flowBands:pointerout', 'update': 'null'}]},
        {'name': 'focusNode', 'update': 'hoverNode || selectedNode'},
    ]
    spec['scales'] = [
        {'name': 'agreementColour', 'type': 'ordinal',
         'domain': ['Same classification', 'Different classification'],
         'range': [SAME, DIFFERENT]},
    ]
    links = next(d for d in spec['data'] if d['name'] == 'links')
    links['transform'] = [{'type': 'formula', 'as': 'pair', 'expr': "datum.a + ':' + datum.b"},
                          {'type': 'formula', 'as': 'agreement',
                           'expr': "datum.a == datum.b ? 'Same classification' : 'Different classification'"}]
    band = spec['marks'][0]
    band['name'] = 'flowBands'
    band['encode'].pop('enter', None)
    band['encode'].pop('hover', None)
    band['encode']['update'].update({
        'fill': {'scale': 'agreementColour', 'field': 'agreement'},
        'opacity': {'signal': "hoverLink ? (datum.a == hoverLink.a && datum.b == hoverLink.b ? 1 : 0.12) : focusNode ? ((focusNode.side == 'left' ? datum.a : datum.b) == focusNode.label ? 0.95 : 0.12) : 0.8"},
        'stroke': {'value': '#243d37'},
        'strokeWidth': {'signal': "hoverLink && datum.a == hoverLink.a && datum.b == hoverLink.b ? 1 : 0"},
        'tooltip': {'signal': "{'HbA1c classification': datum.a, 'FPG classification': datum.b, 'Agreement': datum.agreement, 'Eligible adults (%)': format(datum.percent, '.1f'), 'Reliability': datum.caution || 'No caution flag supplied'}"},
    })
    # Check the actual link dataset rather than assuming all category pairs exist.
    node_connected = "hoverLink ? datum.label == (datum.side == 'left' ? hoverLink.a : hoverLink.b) : !focusNode || (datum.side == focusNode.side ? datum.label == focusNode.label : indata('links', 'pair', focusNode.side == 'left' ? focusNode.label + ':' + datum.label : datum.label + ':' + focusNode.label))"
    for index, name in [(1, 'categoryNodes'), (2, 'categoryLabels')]:
        mark = spec['marks'][index]
        mark['name'] = name
        mark['encode']['update']['opacity'] = {'signal': '(' + node_connected + ') ? 1 : 0.3'}
        mark['encode']['update']['cursor'] = {'value': 'pointer'}
        mark['encode']['update']['tooltip'] = {'signal': "{'Test': datum.side == 'left' ? 'HbA1c' : 'Fasting glucose', 'Classification': datum.label, 'Action': 'Select to highlight connected bands; select again to clear'}"}
    spec['marks'][1]['encode']['update'].update({
        'stroke': {'value': '#243d37'},
        'strokeWidth': {'signal': "selectedNode && datum.side == selectedNode.side && datum.label == selectedNode.label ? 2 : 0"},
    })
    return spec


if __name__ == '__main__':
    path = ROOT / 'js/12-test-classification.vg.json'
    path.write_text(json.dumps(enhance_alluvial(json.loads(path.read_text())), indent=2, ensure_ascii=False) + '\n')
    print('Updated alluvial agreement colours and connection highlighting.')
