import * as ohm from 'ohm-js';
import type { AstArray, AstAttribute, AstDecorator, AstFunction, AstModel, AstStatement, AstType, Literal } from './ast.js';
export const grammar = String.raw`
Model {
   Main = space* Models
   Models = Model (space* Model)* space*
   Model = ("model" | "#model") space* ident space* block
   space := whitespace | lineTerminator
   block
    =  "{" space* (whitespace* contents)+ space *"}" --multiple_stmt
     | "{" space* stmt space* "}"  --one_stmt
     | "{" space* "}" --zero_stmt
   contents = stmt whitespace* decorators? whitespace* lineTerminator+
   stmt = ident whitespace* ":" whitespace* type
   type
    =  ident whitespace* "?" -- null
    | ident -- not_null
   decorators
    = decorator whitespace+ (space? decorator whitespace*)* --inline_multiple_decorator
     | decorator
   decorator
    = "@" ident space* "(" attributes* ")" --func
     | "@" ident --unfunc

   attributes = attribute (space* "," space* attribute)*
   attribute 
    = ident space* ":" space* literal --field_attr
     | literal --literal_attr
   
   literal = function | array | ident | number
   function = ident space* "(" attributes* space* ")"
   array
    = "[" space* elements space* "]"  -- nonEmpty
    | "[" space* "]"  -- empty
    
   elements = literal (space* "," space* literal)*
   ident  (an identifier)
    = letter (alnum | "_")*
   
   number  (a number)
    = digit* "." digit+  -- fract
    | digit+             -- whole
  whitespace = "\t"
             | "\x0B"    -- verticalTab
             | "\x0C"    -- formFeed
             | " "
             | "\u00A0"  -- noBreakSpace
             | "\uFEFF"  -- byteOrderMark

  lineTerminator = "\n" | "\r" | "\u2028" | "\u2029" | lineTerminatorSequence
  lineTerminatorSequence = "\n" | "\r" ~"\n" | "\u2028" | "\u2029" | "\r\n"
}
`
export const modelGrammar = ohm.grammar(grammar);
const semantics = modelGrammar.createSemantics();

semantics.addOperation<any>('ast', {
    Main(this: ohm.Node, _space: ohm.Node, models: ohm.Node): AstModel[] {
        return models.ast()
    },
    Models(this: ohm.Node, first: ohm.Node, _space1: ohm.Node, rest: ohm.Node, _: any): AstModel[] {
        return [first.ast(), ...rest.children.map(a => a.ast())];
    },
    Model(this: ohm.Node, model: ohm.Node, _space1: ohm.Node, name: ohm.Node, _space2: ohm.Node, block: ohm.Node): AstModel {
        return {
            type: 'Model',
            name: name.ast(),
            children: block.ast(),
            unused: model.sourceString.startsWith("#")
        };
    },
    block_multiple_stmt(this: ohm.Node, _open: ohm.Node, _space1: ohm.Node, _space2: ohm.Node, contents: ohm.Node, _space3: ohm.Node, _: any): AstStatement[] {
        return contents.children.map((child: ohm.Node) => child.ast());
    },
    block_one_stmt(this: ohm.Node, _open: ohm.Node, _space1: ohm.Node, stmt: ohm.Node, _space2: ohm.Node, _close: ohm.Node): AstStatement[] {
        return [stmt.ast()];
    },
    block_zero_stmt(this: ohm.Node, _open: ohm.Node, _space: ohm.Node, _close: ohm.Node): AstStatement[] {
        return [];
    },
    contents(this: ohm.Node, stmt: ohm.Node, _ws: ohm.Node, decorators: ohm.Node, _ws2: ohm.Node, _lineTerminator: ohm.Node): AstStatement {
        const result = stmt.ast() as AstStatement;
        const decoratorsAst = decorators.children.map(a => a.ast());
        if (decoratorsAst) {
            result.decorators = decoratorsAst;
        }
        return result;
    },
    stmt(this: ohm.Node, name: ohm.Node, _ws1: ohm.Node, _colon: ohm.Node, _ws2: ohm.Node, type: ohm.Node): AstStatement {
        return {
            type: 'Statement',
            name: name.ast(),
            valueType: type.ast()
        };
    },
    type_null(this: ohm.Node, typeName: ohm.Node, _ws: ohm.Node, _question: ohm.Node): AstType {
        return {
            type: typeName.ast(),
            nullable: true
        };
    },
    type_not_null(this: ohm.Node, typeName: ohm.Node): AstType {
        return {
            type: typeName.ast(),
            nullable: false
        };
    },
    decorators_inline_multiple_decorator(this: ohm.Node, first: ohm.Node, _ws1: ohm.Node, _: ohm.Node, rest: ohm.Node, v: any): AstDecorator[] {
        console.log(rest.children.map(a => a.ast()))
        return [first.ast(), ...rest.children.map(a => a.ast())];
    },
    decorator_func(this: ohm.Node, _at: ohm.Node, name: ohm.Node, _space: ohm.Node, _open: ohm.Node, attributes: ohm.Node, _close: ohm.Node): AstDecorator {
        return {
            type: 'Decorator',
            name: name.ast(),
            attributes: attributes.children.map(a => a.ast())
        };
    },
    decorator_unfunc(this: ohm.Node, _at: ohm.Node, name: ohm.Node): AstDecorator {
        return {
            type: 'Decorator',
            name: name.ast()
        };
    },
    attributes(this: ohm.Node, first: ohm.Node, _space1: ohm.Node, _comma: ohm.Node, _space2: ohm.Node, rest: ohm.Node): AstAttribute[] {
        return [first.ast(), ...rest.children.map(a => a.ast())];
    },
    attribute_field_attr(this: ohm.Node, name: ohm.Node, _space1: ohm.Node, _colon: ohm.Node, _space2: ohm.Node, value: ohm.Node): AstAttribute {
        return {
            type: 'Attribute',
            name: name.ast(),
            value: value.ast()
        };
    },
    attribute_literal_attr(this: ohm.Node, value: ohm.Node): AstAttribute {
        return {
            type: 'Attribute',
            value: value.ast()
        };
    },
    function(this: ohm.Node, name: ohm.Node, _space1: ohm.Node, _open: ohm.Node, attributes: ohm.Node, _space2: ohm.Node, _close: ohm.Node): AstFunction {
        return {
            type: 'Function',
            name: name.ast(),
            arguments: attributes.children.map(a => a.ast())
        };
    },
    array_nonEmpty(this: ohm.Node, _open: ohm.Node, _space2: ohm.Node, elements: ohm.Node, _space3: ohm.Node, _close: ohm.Node): AstArray {
        return {
            type: 'Array',
            elements: elements.ast()
        };
    },
    array_empty(this: ohm.Node, _open: ohm.Node, _space2: ohm.Node, _close: ohm.Node): AstArray {
        return {
            type: 'Array',
            elements: []
        };
    },
    elements(this: ohm.Node, first: ohm.Node, _space2: ohm.Node, _comma: ohm.Node, _space3: ohm.Node, rest: ohm.Node): Literal[] {
        return [first.ast(), ...rest.children.map(a => a.ast())];
    },
    ident(this: ohm.Node, _first: ohm.Node, _rest: ohm.Node): string {
        return this.sourceString;
    },
    number_fract(this: ohm.Node, _whole: ohm.Node, _dot: ohm.Node, _fract: ohm.Node): number {
        return parseFloat(this.sourceString);
    },
    number_whole(this: ohm.Node, _whole: ohm.Node): number {
        return parseInt(this.sourceString, 10);
    }
});

export function parse(input: string): AstModel | undefined {
    const matchResult = modelGrammar.match(input);
    if (matchResult) {
        return semantics(matchResult).ast();
    }
}