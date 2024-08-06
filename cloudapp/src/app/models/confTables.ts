namespace ConfTable {
  export interface Code {
    code: string,
    description: string
  }
  
  export interface CodeTable {
    total_rows_count: number,
    row: Code[]
  }

  export interface Mapping {
    column0: string,
    column1: string,
    enabled: boolean
  }
  
  export interface MappingTable {
    total_rows_count: number,
    row: Mapping[]
  }
}

function findRowByCode(codeTable: ConfTable.CodeTable, searchCode: string): ConfTable.Code | undefined {
  return codeTable.row.find(code => code.code === searchCode);
}

export { ConfTable };