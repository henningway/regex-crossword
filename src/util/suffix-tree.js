import { concat, join, map, xprod } from 'ramda';

// adapted from https://github.com/eikes/suffixtree/blob/7881873e53a2510ea706052ba70c8ae4a07820a2/js/suffixtree.js

/*
 * Copyright (C) 2012 Eike Send
 *
 * http://eike.se/nd
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

function Node() {
    this.value = '';
    this.leaves = [];
    this.nodes = [];
}

Node.prototype.checkNodes = function (suf) {
    let node;

    for (let i = 0; i < this.nodes.length; i++) {
        node = this.nodes[i];

        if (node.value == suf[0]) {
            node.addSuffix(suf.slice(1));
            return true;
        }
    }

    return false;
};

Node.prototype.checkLeaves = function (suf) {
    let node, leaf;

    for (let i = 0; i < this.leaves.length; i++) {
        leaf = this.leaves[i];

        if (leaf[0] == suf[0]) {
            node = new Node();
            node.value = leaf[0];
            node.addSuffix(suf.slice(1));
            node.addSuffix(leaf.slice(1));
            this.nodes.push(node);
            this.leaves.splice(i, 1);
            return;
        }
    }
    this.leaves.push(suf);
};

Node.prototype.addSuffix = function (suf) {
    if (!suf.length) return;
    if (!this.checkNodes(suf)) this.checkLeaves(suf);
};

Node.prototype.getLongestRepeatedSubString = function () {
    let str = '';
    let temp = '';

    for (let i = 0; i < this.nodes.length; i++) {
        temp = this.nodes[i].getLongestRepeatedSubString();
        if (temp.length > str.length) str = temp;
    }

    return this.value + str;
};

Node.prototype.getAllRepeatedSubSuffixes = function () {
    let substrings = [];

    for (let i = 0; i < this.nodes.length; i++)
        substrings = concat(substrings, this.nodes[i].getAllRepeatedSubSuffixes());

    return substrings.length > 0 && this.value.length > 0
        ? map(join(''), xprod(this.value, substrings))
        : this.value.length > 0
        ? [this.value]
        : substrings;
};

Node.prototype.toHTML = function () {
    var html = '<div class=node>';
    if (this.value.length) {
        html += '<h3>' + this.value + '</h3>';
    }
    if (this.nodes.length) {
        html += '<h4>nodes</h4><ul>';
        for (var i = 0; i < this.nodes.length; i++) {
            html += '<li>' + this.nodes[i].toHTML() + '</li>';
        }
        html += '</ul>';
    }
    if (this.leaves.length) {
        html += '<h4>leaves</h4><ul>';
        for (var i = 0; i < this.leaves.length; i++) {
            html += '<li>' + this.leaves[i] + '</li>';
        }
        html += '</ul>';
    }
    return html;
};

export function SuffixTree(str) {
    this.node = new Node();

    for (var i = 0; i < str.length; i++) {
        this.node.addSuffix(str.slice(i));
    }
}

if (import.meta.vitest) {
    const { describe, it, expect } = import.meta.vitest;

    describe('suffix tree', () => {
        it('can generate html output representing the suffix tree', () => {
            const tree = new SuffixTree('BANANA');

            expect(tree.node.toHTML()).toBe(
                '<div class=node><h4>nodes</h4><ul><li><div class=node><h3>A</h3><h4>nodes</h4><ul><li><div class=node><h3>N</h3><h4>nodes</h4><ul><li><div class=node><h3>A</h3><h4>leaves</h4><ul><li>NA</li></ul></li></ul></li></ul></li><li><div class=node><h3>N</h3><h4>nodes</h4><ul><li><div class=node><h3>A</h3><h4>leaves</h4><ul><li>NA</li></ul></li></ul></li></ul><h4>leaves</h4><ul><li>BANANA</li></ul>'
            );
        });

        it('can provide all repeated substrings of a string', () => {
            const bananaTree = new SuffixTree('BANANA');
            expect(bananaTree.node.getAllRepeatedSubSuffixes()).toStrictEqual(['ANA', 'NA']);
            const mississippiTree = new SuffixTree('MISSISSIPPI');
            expect(mississippiTree.node.getAllRepeatedSubSuffixes()).toStrictEqual(['SSI', 'SI', 'ISSI', 'P']);
        });
    });
}
