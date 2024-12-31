export type ASTNode = AstModel | AstStatement | AstType | AstDecorator | AstAttribute | AstFunction | AstArray;

export interface AstModel {
    type: 'Model';
    name: string;
    children: AstStatement[];
    unused?: boolean
}

export interface AstStatement {
    type: 'Statement';
    name: string;
    valueType: AstType;
    decorators?: AstDecorator[];
}

export interface AstType {
    type: string;
    nullable: boolean;
}

export interface AstDecorator {
    type: 'Decorator';
    name: string;
    attributes?: AstAttribute[];
}

export interface AstAttribute {
    type: 'Attribute';
    name?: string;
    value: Literal;
}

export interface AstFunction {
    type: 'Function';
    name: string;
    arguments: AstAttribute[];
}

export interface AstArray {
    type: 'Array';
    elements: Literal[];
}

export type Literal = string | number | AstFunction | AstArray;