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
  isWeightExport?: boolean
  weightMethod?: string
  projectName?: string
  userId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json()
    const { method, ranking, alternatives, criteria, metrics, resultsDecimalPlaces, isWeightExport, weightMethod } = body

    const methodLabel = method.toUpperCase()
    const now = new Date()
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`

    // Create a new workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Results")

    // Default Font: Cambria
    const defaultFont = { name: "Cambria", size: 11 }
    const boldFont = { name: "Cambria", size: 11, bold: true }

    // Number format for uniform decimals
    const numFmt = resultsDecimalPlaces > 0 ? "0." + "0".repeat(resultsDecimalPlaces) : "0"

    const borderStyle = {
      top: { style: "thin" as const, color: { argb: "FF000000" } },
      bottom: { style: "thin" as const, color: { argb: "FF000000" } },
      left: { style: "thin" as const, color: { argb: "FF000000" } },
      right: { style: "thin" as const, color: { argb: "FF000000" } }
    }

    // Helper to get formatted criterion name with direction
    const getCriterionHeader = (c: Criterion) => {
      const arrow = c.type === "beneficial" ? "↑" : "↓"
      const typeLabel = c.type === "beneficial" ? "Max" : "Min"
      return `${c.name} ${arrow} (${typeLabel})`
    }

    // Helper function to add data with borders and centering
    const addRowWithBorder = (data: any[], isBordered = true, options: { isBold?: boolean; alignment?: any; useNumFmt?: boolean } = {}) => {
      const row = worksheet.addRow(data)
      row.eachCell((cell, colNumber) => {
        cell.font = options.isBold ? boldFont : defaultFont

        if (isBordered) {
          cell.border = borderStyle
        }

        // Alignment: Centered by default as requested
        cell.alignment = options.alignment || { horizontal: "center", vertical: "middle" }

        // Apply number format to numeric values (excluding the first column which is usually labels)
        if (options.useNumFmt && colNumber > 1 && typeof cell.value === "number") {
          cell.numFmt = numFmt
        }
      })
      return row
    }

    // 1. Metadata Table (Header Section)
    addRowWithBorder(["MCDM Analysis Report", `Date: ${dateStr}`], true, { isBold: true })
    addRowWithBorder(["Method", methodLabel], true)
    addRowWithBorder(["Number of Alternatives", alternatives.length], true)
    addRowWithBorder(["Number of Criteria", criteria.length], true)
    addRowWithBorder(["Project", body.projectName || "Analysis 1"], true)
    addRowWithBorder(["User Id:", body.userId || "User 1"], true)

    worksheet.addRow([]) // White space

    let tableIndex = 1

    // Table 1: Decision Matrix is ALWAYS the first table for Weight Methods
    if (isWeightExport) {
      addRowWithBorder([`Table ${tableIndex}: Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
      addRowWithBorder(["Original Decision Matrix"], false, { alignment: { horizontal: "left" } })
      worksheet.addRow([])

      const decisionHeader = ["Alternative", ...criteria.map(getCriterionHeader)]
      addRowWithBorder(decisionHeader, true, { isBold: true })

      alternatives.forEach((alt: Alternative) => {
        const row: (string | number)[] = [alt.name]
        criteria.forEach((crit: Criterion) => {
          const val = alt.scores[crit.id]
          row.push(typeof val === 'number' ? val : (parseFloat(val as any) || 0))
        })
        addRowWithBorder(row, true, { useNumFmt: true })
      })
      worksheet.addRow([])
      worksheet.addRow([])
      tableIndex++
    } else {
      // Standard Ranking Results report
      // Table 1: Criteria weight Matrix
      addRowWithBorder([`Table ${tableIndex}: Criteria weight Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
      worksheet.addRow([])

      const weightHeaders = ["Criteria", ...criteria.map(getCriterionHeader)]
      addRowWithBorder(weightHeaders, true, { isBold: true })

      const weightsRow = [`Weight (${weightMethod || "Weights"})`, ...criteria.map((c: Criterion) => c.weight ?? 0)]
      addRowWithBorder(weightsRow, true, { useNumFmt: true })

      worksheet.addRow([])
      worksheet.addRow([])
      tableIndex++

      // Table 2: Decision Matrix
      addRowWithBorder([`Table ${tableIndex}: Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
      addRowWithBorder(["Original Decision Matrix"], false, { alignment: { horizontal: "left" } })
      worksheet.addRow([])

      const decisionHeader = ["Alternative", ...criteria.map(getCriterionHeader)]
      addRowWithBorder(decisionHeader, true, { isBold: true })

      alternatives.forEach((alt: Alternative) => {
        const row: (string | number)[] = [alt.name]
        criteria.forEach((crit: Criterion) => {
          const val = alt.scores[crit.id]
          row.push(typeof val === 'number' ? val : (parseFloat(val as any) || 0))
        })
        addRowWithBorder(row, true, { useNumFmt: true })
      })
      worksheet.addRow([])
      worksheet.addRow([])
      tableIndex++
    }

    // Process Metrics (Normalized Matrix, etc.)
    if (metrics) {
      const preferredOrder = [
        'normalizedMatrix',
        'entropyMatrix',
        'standardDeviations',
        'correlationMatrix',
        'informationAmounts',
        'diversityValues',
        'entropyValues',
        'logarithmicMatrix',
        'performanceMeasures',
        'removedWeightPerformanceMatrices',
        'absoluteDifferenceSums',
        'pairwiseMatrix',
        'consistencyRatio',
        'weights',
        'weightsWj'
      ]

      const metricKeys = Object.keys(metrics).filter(k =>
        k.toLowerCase().includes('matrix') ||
        k.toLowerCase().includes('normalized') ||
        k.toLowerCase().includes('score') ||
        k.toLowerCase().includes('flow') ||
        k.toLowerCase().includes('weight') ||
        k.toLowerCase().includes('value') ||
        k.toLowerCase().includes('degree') ||
        k.toLowerCase().includes('deviation') ||
        k.toLowerCase().includes('amount') ||
        k.toLowerCase().includes('measure') ||
        k.toLowerCase().includes('entropy') ||
        k.toLowerCase().includes('pairwise') ||
        k.toLowerCase().includes('consistency')
      ).sort((a, b) => {
        const indexA = preferredOrder.indexOf(a)
        const indexB = preferredOrder.indexOf(b)

        if (indexA !== -1 && indexB !== -1) return indexA - indexB
        if (indexA !== -1) return -1
        if (indexB !== -1) return 1

        return a.localeCompare(b)
      })

      const skippedKeys = new Set<string>()

      metricKeys.forEach((key) => {
        if (skippedKeys.has(key)) return

        const value = metrics[key]

        // Handle Scalars (like Consistency Ratio)
        if (key === 'consistencyRatio' && typeof value === 'number') {
          addRowWithBorder([`Consistency Ratio (CR): ${value.toFixed(resultsDecimalPlaces)}`], true, { isBold: true })
          worksheet.addRow([])
          return
        }

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          let tableName = key.replace(/([A-Z])/g, ' $1').trim().replace(/^[a-z]/, (char) => char.toUpperCase())
          let rowHeader = tableName

          const methodLower = weightMethod?.toLowerCase() || ''
          const isEntropy = methodLower.includes('entropy')
          const isCritic = methodLower.includes('critic')

          if (key === 'weights' || key === 'weightsWj') {
            tableName = 'Final Weights'
            rowHeader = 'Weights'
          } else if (key === 'diversityValues') {
            tableName = 'Diversity Degree'
            rowHeader = 'Diversity Degree'
          } else if (key === 'normalizedMatrix') {
            tableName = isEntropy ? 'Normalized Decision Matrix' : (isCritic ? 'Normalization (r_ij)' : 'Normalized Decision Matrix')
          } else if (key === 'entropyMatrix') {
            tableName = 'Entropy for Attributes'
          } else if (key === 'standardDeviations') {
            tableName = 'Standard Deviation (σ_j)'
            rowHeader = 'Standard Deviation'
          } else if (key === 'correlationMatrix') {
            tableName = 'Correlation Matrix (r_jk)'
          } else if (key === 'informationAmounts') {
            tableName = 'Information Measure (Cj)'
            rowHeader = 'Information Measure'
          } else if (key === 'pairwiseMatrix') {
            tableName = 'AHP Pairwise Comparison Matrix'
          }

          const valueAsObj = value as Record<string, any>
          const values = Object.values(valueAsObj)
          const firstVal = values[0]

          if (firstVal !== undefined && typeof firstVal === 'object' && !Array.isArray(firstVal)) {
            // Matrix Processing
            addRowWithBorder([`Table ${tableIndex}: ${tableName}`], false, { isBold: true, alignment: { horizontal: "left" } })
            worksheet.addRow([])

            const rowIds = Object.keys(valueAsObj)
            const firstValObj = firstVal as Record<string, any>
            const colIds = Object.keys(firstValObj)

            const isCriterionMatrix = key === 'correlationMatrix' || key === 'pairwiseMatrix' || key === 'matrix'

            const headerRow = [
              isCriterionMatrix ? "Criterion" : "Alternative",
              ...colIds.map((cid: string) => {
                const crit = criteria.find(c => c.id === cid)
                return crit ? getCriterionHeader(crit) : cid
              })
            ]
            addRowWithBorder(headerRow, true, { isBold: true })

            rowIds.forEach((rid: string) => {
              const row: (string | number)[] = [
                isCriterionMatrix ? (criteria.find(c => c.id === rid)?.name || rid) : (alternatives.find(a => a.id === rid)?.name || rid)
              ]
              const matrixRow = valueAsObj[rid] as Record<string, any>
              colIds.forEach((cid: string) => {
                row.push(matrixRow[cid] ?? 0)
              })
              addRowWithBorder(row, true, { useNumFmt: true })
            })

            // Special handling for Entropy (Ej) row at the bottom of Table 3
            if (isEntropy && key === 'entropyMatrix' && metrics['entropyValues']) {
              const ejValues = metrics['entropyValues'] as Record<string, number>
              const ejRow = ["Entropy (Ej)", ...colIds.map(cid => ejValues[cid] ?? 0)]
              addRowWithBorder(ejRow, true, { isBold: true, useNumFmt: true })
              skippedKeys.add('entropyValues')
            }

            worksheet.addRow([])
            worksheet.addRow([])
            tableIndex++
          } else if (values.length > 0) {
            // Vector Processing
            addRowWithBorder([`Table ${tableIndex}: ${tableName}`], false, { isBold: true, alignment: { horizontal: "left" } })
            worksheet.addRow([])

            const keys = Object.keys(valueAsObj)
            const isPerCriterion = keys.every(k => criteria.some((c: Criterion) => c.id === k))
            const isPerAlternative = keys.every(k => alternatives.some((a: Alternative) => a.id === k))

            if (isPerCriterion) {
              const relevantCriteria = criteria.filter((c: Criterion) => keys.includes(c.id))
              addRowWithBorder(["Criteria", ...relevantCriteria.map(getCriterionHeader)], true, { isBold: true })

              const dataRow = [rowHeader, ...relevantCriteria.map((c: Criterion) => valueAsObj[c.id] ?? 0)]
              addRowWithBorder(dataRow, true, { useNumFmt: true })

              worksheet.addRow([])
              worksheet.addRow([])
              tableIndex++
            } else if (isPerAlternative) {
              addRowWithBorder(["Alternative", "Value"], true, { isBold: true })
              keys.forEach(k => {
                const altName = alternatives.find((a: Alternative) => a.id === k)?.name || k
                addRowWithBorder([altName, valueAsObj[k]], true, { useNumFmt: true })
              })

              worksheet.addRow([])
              worksheet.addRow([])
              tableIndex++
            }
          }
        }
      })
    }

    // Ranking results at the end
    if (!isWeightExport && ranking && ranking.length > 0) {
      addRowWithBorder([`Table ${tableIndex}: Ranking Results`], false, { isBold: true, alignment: { horizontal: "left" } })
      worksheet.addRow([])
      addRowWithBorder(["Rank", "Alternative", "Score"], true, { isBold: true })
      ranking.forEach((item: any) => {
        addRowWithBorder([item.rank, item.alternativeName, item.score], true, { useNumFmt: true })
      })
    }

    // Set orientation to landscape for wider tables
    worksheet.pageSetup = {
      orientation: 'landscape',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    }

    // Set column widths
    worksheet.columns = [
      { width: 35 },
      ...criteria.map(() => ({ width: 22 }))
    ]

    const buffer = await workbook.xlsx.writeBuffer()
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${methodLabel}_Results.xlsx"`
      }
    })
  } catch (err) {
    console.error("Export error:", err)
    return NextResponse.json({ error: "Failed to export to Excel" }, { status: 500 })
  }
}
