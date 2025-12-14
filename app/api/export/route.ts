import { NextRequest, NextResponse } from "next/server"
import ExcelJS from "exceljs"
import type { Alternative, Criterion } from "../calculate/types"

interface ExportRequest {
  method: string
  ranking: any[]
  alternatives: Alternative[]
  criteria: Criterion[]
  metrics?: Record<string, any>
  resultsDecimalPlaces: number
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json()
    const { method, ranking, alternatives, criteria, metrics, resultsDecimalPlaces } = body

    const methodLabel = method.toUpperCase()

    // Create a new workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Results")

    let currentRow = 1
    const borderStyle = {
      top: { style: "thin" as const, color: { argb: "FF000000" } },
      bottom: { style: "thin" as const, color: { argb: "FF000000" } },
      left: { style: "thin" as const, color: { argb: "FF000000" } },
      right: { style: "thin" as const, color: { argb: "FF000000" } }
    }

    // Helper function to add data with borders
    const addRowWithBorder = (data: any[], isBordered = true) => {
      const row = worksheet.addRow(data)
      if (isBordered) {
        row.eachCell((cell) => {
          cell.border = borderStyle
        })
      }
      currentRow++
      return row
    }

    // Header: Report Title
    addRowWithBorder(["MCDM Analysis Report"], false)
    addRowWithBorder(["Method", methodLabel], true)
    addRowWithBorder(["Number of Alternatives", alternatives.length], true)
    addRowWithBorder(["Number of Criteria", criteria.length], true)
    addRowWithBorder([])
    addRowWithBorder([])

    // Table 1: Ranking Results
    addRowWithBorder(["Table 1: Ranking Results"], false)
    addRowWithBorder([])
    addRowWithBorder(["Rank", "Alternative", "Score"], true)
    ranking.forEach((item: any) => {
      addRowWithBorder([
        item.rank,
        item.alternativeName,
        typeof item.score === "number" ? Number(item.score.toFixed(resultsDecimalPlaces)) : item.score
      ], true)
    })
    addRowWithBorder([])
    addRowWithBorder([])

    // Table 2+: All Intermediate Matrices from Metrics
    let tableIndex = 2

    if (metrics) {
      Object.entries(metrics).forEach(([metricKey, value]) => {
        // Create readable name from camelCase
        let tableName = metricKey
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .replace(/^[a-z]/, (char) => char.toUpperCase())

        // Clean up the name
        tableName = tableName
          .replace(/swei /gi, 'SWEI ')
          .replace(/swi /gi, 'SWI ')
          .replace(/topsis /gi, 'TOPSIS ')
          .replace(/vikor /gi, 'VIKOR ')
          .replace(/moora /gi, 'MOORA ')
          .replace(/moosra /gi, 'MOOSRA ')
          .replace(/edas /gi, 'EDAS ')
          .replace(/todim /gi, 'TODIM ')
          .replace(/codas /gi, 'CODAS ')
          .replace(/waspas /gi, 'WASPAS ')
          .replace(/copras /gi, 'COPRAS ')
          .replace(/promethee /gi, 'PROMETHEE ')
          .replace(/electre /gi, 'ELECTRE ')
          .replace(/cocoso /gi, 'COCOSO ')
          .replace(/marcos /gi, 'MARCOS ')
          .replace(/mairca /gi, 'MAIRCA ')

        // Check if it's a nested object structure (matrix with alt -> criteria mapping)
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const valueAsObj = value as Record<string, any>
          const firstVal = Object.values(valueAsObj)[0]

          // If the first value is also an object (nested structure), it's a matrix
          if (firstVal && typeof firstVal === 'object' && !Array.isArray(firstVal)) {
            // Nested object matrix: { altId: { critId: value, ... }, ... }
            addRowWithBorder([`Table ${tableIndex}: ${tableName}`], false)
            addRowWithBorder([])

            const altIds = Object.keys(valueAsObj)
            const critIds = Object.keys(firstVal as Record<string, any>)

            // Header row
            const headerRow = ["Alternative", ...critIds.map(critId => {
              const criterion = criteria.find(c => c.id === critId)
              return criterion ? criterion.name : critId
            })]
            addRowWithBorder(headerRow, true)

            // Data rows
            altIds.forEach(altId => {
              const alt = alternatives.find(a => a.id === altId)
              const altName = alt ? alt.name : altId
              const row = [altName]

              const matrixRow = valueAsObj[altId] as Record<string, any>
              critIds.forEach(critId => {
                const v = matrixRow[critId]
                const displayValue = v !== null && v !== undefined
                  ? (typeof v === 'number' ? Number(v.toFixed(resultsDecimalPlaces)) : v)
                  : ""
                row.push(displayValue)
              })

              addRowWithBorder(row, true)
            })

            addRowWithBorder([])
            addRowWithBorder([])
            tableIndex++
          } else if (typeof firstVal === 'number' || typeof firstVal === 'string') {
            // Simple object mapping: { altId: score, ... }
            addRowWithBorder([`Table ${tableIndex}: ${tableName}`], false)
            addRowWithBorder([])
            addRowWithBorder(["Alternative", "Value"], true)
            Object.entries(valueAsObj).forEach(([k, v]) => {
              const displayKey = alternatives.find(a => a.id === k)?.name || k
              const displayValue = v !== null && v !== undefined
                ? (typeof v === 'number' ? Number((v as number).toFixed(resultsDecimalPlaces)) : v)
                : ""
              addRowWithBorder([displayKey, displayValue], true)
            })
            addRowWithBorder([])
            addRowWithBorder([])
            tableIndex++
          }
        } else if (Array.isArray(value) && value.length > 0) {
          if (Array.isArray(value[0])) {
            // Matrix-like data (array of arrays)
            addRowWithBorder([`Table ${tableIndex}: ${tableName}`], false)
            addRowWithBorder([])

            // Check if rows match alternatives count
            if (value.length === alternatives.length) {
              addRowWithBorder(["Alternative", ...criteria.map(c => c.name)], true)
              value.forEach((row: any[], idx: number) => {
                addRowWithBorder([
                  alternatives[idx]?.name || `Alt ${idx + 1}`,
                  ...row.map((v: any) => typeof v === 'number' ? Number(v.toFixed(resultsDecimalPlaces)) : v)
                ], true)
              })
            } else {
              // Generic matrix without alternative alignment
              value.forEach((row: any[]) => {
                addRowWithBorder(row.map((v: any) => typeof v === 'number' ? Number(v.toFixed(resultsDecimalPlaces)) : v), true)
              })
            }

            addRowWithBorder([])
            addRowWithBorder([])
            tableIndex++
          } else if (typeof value[0] === 'object' && value[0] !== null && !Array.isArray(value[0])) {
            // Array of objects
            addRowWithBorder([`Table ${tableIndex}: ${tableName}`], false)
            addRowWithBorder([])
            const headers = Array.from(new Set(value.flatMap((o: any) => Object.keys(o))))
            addRowWithBorder(headers, true)
            value.forEach((obj: any) => {
              addRowWithBorder(headers.map(h => {
                const v = obj[h]
                return typeof v === 'number' ? Number(v.toFixed(resultsDecimalPlaces)) : v
              }), true)
            })
            addRowWithBorder([])
            addRowWithBorder([])
            tableIndex++
          } else {
            // Simple list/array of primitives or numeric values
            addRowWithBorder([`Table ${tableIndex}: ${tableName}`], false)
            addRowWithBorder([])
            addRowWithBorder(["Alternative", "Value"], true)
            value.forEach((v: any, idx: number) => {
              const displayValue = v !== null && v !== undefined
                ? (typeof v === 'number' ? Number(v.toFixed(resultsDecimalPlaces)) : v)
                : ""
              addRowWithBorder([
                alternatives[idx]?.name || `Alt ${idx + 1}`,
                displayValue
              ], true)
            })
            addRowWithBorder([])
            addRowWithBorder([])
            tableIndex++
          }
        }
      })
    }

    // Final Table: Criteria Weights
    addRowWithBorder([`Table ${tableIndex}: Criteria Weights`], false)
    addRowWithBorder([])
    addRowWithBorder(["Criterion", "Weight", "Type"], true)
    criteria.forEach(c => {
      addRowWithBorder([
        c.name,
        typeof c.weight === "number" ? Number(c.weight.toFixed(resultsDecimalPlaces)) : c.weight,
        c.type === "beneficial" ? "Max" : "Min"
      ], true)
    })

    // Set column widths
    worksheet.columns = [
      { width: 20 },
      { width: 16 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 14 }
    ]

    // Write file to buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Return as file download
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${methodLabel}_Results.xlsx"`
      }
    })
  } catch (err) {
    console.error("Export error:", err)
    return NextResponse.json(
      { error: "Failed to export to Excel" },
      { status: 500 }
    )
  }
}
