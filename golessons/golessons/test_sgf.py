import re


LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"


def get_coordinate(letter):
    return LETTERS.find(letter)


def translate_sgf(sgf):
    def translate_sgf_inner(sgf):
        print('translate: ' + sgf)
        node = {}

        tree_match = re.match(r'\s*\(;(?P<node_seq>.*?)\s*(?P<children>\)*\s*\(\s*;.*)', sgf, re.S)
        if not tree_match:
            tree_match = re.match(r'\s*\(;(?P<node_seq>.*?)\s*(?P<children>\)+)', sgf, re.S)
        node_seq = tree_match.group('node_seq')

        while len(node_seq) > 0:
            print('node_seq: ' + node_seq)
            if node_seq[0] == ';':
                # node sequence; finish node and create child
                child_node = {}
                if 'children' not in node:
                    node['children'] = []
                node['children'].append(child_node)
                node = child_node
                # go on with next node
                node_seq = node_seq[1:]
                continue
            prop_match = re.match(r'\s*(?P<ident>[A-Za-z]+)(?P<values>(\[.*?\])*)\s*(?P<more>.*)', node_seq, re.S)
            raw_prop_values = prop_match.group('values')
            prop_ident = prop_match.group('ident')
            prop_values = [] if not raw_prop_values else raw_prop_values[1:-1].split('][')
            if prop_ident == 'AB' or prop_ident == 'AW':
                if 'addedStones' not in node:
                    node['addedStones'] = []
                added_stones = node['addedStones']
                for prop_value in prop_values:
                    added_stones.append({'color': 1 if prop_ident == 'AB' else 2,
                                         'x': get_coordinate(prop_value[0]),
                                         'y': get_coordinate(prop_value[1])})
            if prop_ident == 'C':
                for prop_value in prop_values:
                    node['comment'] = prop_value
            if prop_ident == 'SZ':
                for prop_value in prop_values:
                    node['boardSize'] = int(prop_value)
            if prop_ident == 'B' or prop_ident == 'W':
                for prop_value in prop_values:
                    node['color'] = 1 if prop_ident == 'B' else 2
                    node['x'] = get_coordinate(prop_value[0])
                    node['y'] = get_coordinate(prop_value[1])

            node_seq = prop_match.group('more')

        children_sgf = tree_match.group('children')

        while children_sgf:
            if children_sgf[0] == ')':
                return node, children_sgf[1:]
            child_node, children_sgf = translate_sgf_inner(children_sgf)
            if 'children' not in node:
                node['children'] = []
            node['children'].append(child_node)

    data, _ = translate_sgf_inner(sgf)
    return data

