import re


LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def get_coordinate(letter):
    return LETTERS.find(letter)


def get_loc_hash(x, y):
    return x * 100 + y


def translate_sgf(sgf):
    def translate_sgf_inner(sgf):
        print('translate: \'' + sgf + '\'')
        node = {}
        root_node = node

        tree_match = re.match(r'\s*\(;(?P<node_seq>.*?)\s*(?P<children>(?:\)\s*)*\(\s*;.*)\s*', sgf, re.S)
        if not tree_match:
            # capture last node_seq of tree
            tree_match = re.match(r'\s*\(;(?P<node_seq>.*?)\s*(?P<children>(?:\)\s*)+)', sgf, re.S)
        node_seq = tree_match.group('node_seq')

        while len(node_seq) > 0:
            print('node_seq: \'' + node_seq + '\'')
            if node_seq[0] == ')':
                break
            if node_seq[0] == ';':
                added_stone_match = re.match(r';\s*(?:AB|AW).*', node_seq, re.S) # hack to combine first two root nodes
                if not added_stone_match:
                    # node sequence; finish node and create child
                    child_node = {}
                    print("NODE: " + str(node))
                    if 'children' not in node:
                        node['children'] = []
                    node['children'].append(child_node)
                    node = child_node

                node_seq = node_seq[1:]
                continue

            prop_match = re.match(r'\s*(?P<ident>[A-Za-z]+)\s*(?P<values>(\[.*?\])*)\s*(?P<more>.*)', node_seq, re.S)
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
            if prop_ident == 'TR':
                if 'labels' not in node:
                    node['labels'] = {}
                node['labels'][get_loc_hash(get_coordinate(prop_value[0]), get_coordinate(prop_value[1]))] = 'T'
            if prop_ident == 'LB':
                if 'labels' not in node:
                    node['labels'] = {}
                for prop_value in prop_values:
                    loc, label_type = prop_value.split(':')
                    node['labels'][get_loc_hash(get_coordinate(loc[0]), get_coordinate(loc[1]))] = label_type
            if prop_ident == 'PL':
                node['firstMove'] = int(prop_values[0])
            if prop_ident == 'B' or prop_ident == 'W':
                for prop_value in prop_values:
                    node['color'] = 1 if prop_ident == 'B' else 2
                    node['x'] = get_coordinate(prop_value[0])
                    node['y'] = get_coordinate(prop_value[1])

            node_seq = prop_match.group('more')

        children_sgf = tree_match.group('children')

        while children_sgf:
            if children_sgf[0] == ')':
                break
            end_branch_match = re.match(r'\s*\)(?P<more>.*)', children_sgf, re.S)
            if end_branch_match:
                children_sgf = end_branch_match.group('more')
                break

            child_node, children_sgf = translate_sgf_inner(children_sgf)

            if 'children' not in node:
                node['children'] = []
            node['children'].append(child_node)
        print('BRANCH DONE: \'' + str(root_node) + '\'')
        return root_node, children_sgf[1:]

    data, _ = translate_sgf_inner(sgf)
    print(data)
    return data

