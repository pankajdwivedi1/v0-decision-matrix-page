// Export Route - Corrected
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

    // Helper to check for method matches (handling both values and labels)
    const isMethod = (val: string | undefined, target: string) => {
      if (!val) return false
      const lowerVal = val.toLowerCase()
      const lowerTarget = target.toLowerCase()
      return lowerVal === lowerTarget || lowerVal.includes(lowerTarget)
    }

    const isTopsis = isMethod(method, 'topsis')
    const isLpwm = isMethod(weightMethod, 'lpwm')
    const isPiprecia = isMethod(weightMethod, 'piprecia')
    const isDematel = isMethod(weightMethod, 'dematel')
    const isEntropy = isMethod(weightMethod, 'entropy')
    const isCritic = isMethod(weightMethod, 'critic')
    const isAras = isMethod(method, 'aras')
    const isCopras = isMethod(method, 'copras')
    const isEdas = isMethod(method, 'edas')
    const isVikor = isMethod(method, 'vikor')
    const isWaspas = isMethod(method, 'waspas')
    const isMabac = isMethod(method, 'mabac')
    const isElectre = isMethod(method, 'electre')
    const isMarcos = isMethod(method, 'marcos')
    const isMoosra = isMethod(method, 'moosra')
    const isCodas = isMethod(method, 'codas')
    const isMairca = isMethod(method, 'mairca')
    const isMultimoora = isMethod(method, 'multimoora')
    const isGra = isMethod(method, 'gra')
    const isCocoso = isMethod(method, 'cocoso')
    const isTodim = isMethod(method, 'todim')
    const isPromethee = isMethod(method, 'promethee')
    const isSwei = isMethod(method, 'swei')
    const isSwi = isMethod(method, 'swi')

    // Table 1: Decision Matrix is the starting point
    // Table 1: Criteria weight Matrix
    if (!isWeightExport) {
      addRowWithBorder([`Table ${tableIndex}: Criteria weight Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
      worksheet.addRow([])

      const weightHeaders = ["Criteria", ...criteria.map(getCriterionHeader)]
      addRowWithBorder(weightHeaders, true, { isBold: true })

      const weightsRow = [`Weight (${weightMethod || "Weights"})`, ...criteria.map((c: Criterion) => c.weight ?? 0)]
      addRowWithBorder(weightsRow, true, { useNumFmt: true })

      worksheet.addRow([])
      worksheet.addRow([])
      tableIndex++
    }

    // Decision Matrix (Table 1 for Topsis/LPWM, Table 2 for others)
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

    // Process Metrics (Normalized Matrix, etc.)
    if (metrics) {
      const preferredOrder = [
        'normalizedMatrix',
        'weightedMatrix',
        'idealBest',
        'idealWorst',
        'idealSolution',
        'antiIdealSolution',
        'avVector',
        'averageSolution',
        'entropyMatrix',
        'standardDeviations',
        'correlationMatrix',
        'informationAmounts',
        'diversityValues',
        'entropyValues',
        'logarithmicMatrix',
        'performanceScores',
        'removalScores',
        'removalEffects',
        'geometricMeans',
        'logPercentages',
        'stepFactors',
        'preliminaryWeights',
        'coefficients',
        's_values',
        'k_values',
        'q_values',
        'directRelationMatrix',
        'totalRelationMatrix',
        'dValues',
        'rValues',
        'pValues',
        'eValues',
        'lambdaMax',
        'consistencyIndex',
        'ranks',
        'means',
        'madValues',
        'independenceMeasures',
        'performanceMeasures',
        'removedWeightPerformanceMatrices',
        'absoluteDifferenceSums',
        'pairwiseMatrix',
        'consistencyRatio',
        'weights',
        'weightsWj'
      ]

      // Special handling for DEMATEL to match web UI exactly
      if (isWeightExport && isDematel && metrics) {
        // DEMATEL Web UI shows exactly these 7 tables in this order:
        const dematelOrder = [
          'normalizedMatrix',      // Table 2
          'directRelationMatrix',  // Table 3
          'totalRelationMatrix'    // Table 4
          // Table 5: D and R - added after loop
          // Table 6: P and E - added after loop
          // Table 7: Weights - added after loop
        ]

        dematelOrder.forEach((key) => {
          const value = metrics[key]
          if (!value || typeof value !== 'object' || Array.isArray(value)) return

          let tableName = ''

          if (key === 'normalizedMatrix') {
            tableName = 'Normalized Decision Matrix'
            addRowWithBorder([`Table ${tableIndex}: ${tableName}`], false, { isBold: true, alignment: { horizontal: "left" } })
            worksheet.addRow([])
            addRowWithBorder(['Normalized for relationship analysis'], false)
            worksheet.addRow([])
          } else if (key === 'directRelationMatrix') {
            tableName = 'Direct Relation Matrix (A)'
            addRowWithBorder([`Table ${tableIndex}: ${tableName}`], false, { isBold: true, alignment: { horizontal: "left" } })
            worksheet.addRow([])
            addRowWithBorder(['Absolute correlation intensities between criteria'], false)
            worksheet.addRow([])
          } else if (key === 'totalRelationMatrix') {
            tableName = 'Total Relation Matrix (T)'
            addRowWithBorder([`Table ${tableIndex}: ${tableName}`], false, { isBold: true, alignment: { horizontal: "left" } })
            worksheet.addRow([])
            addRowWithBorder(['Full impact propagation matrix'], false)
            worksheet.addRow([])
          }

          // For matrices (normalized, direct relation, total relation)
          const valueAsObj = value as Record<string, Record<string, number>>
          const rowIds = Object.keys(valueAsObj)
          if (rowIds.length === 0) return

          const firstRow = valueAsObj[rowIds[0]]
          const colIds = Object.keys(firstRow)

          // Matrix table
          const headerRow = [''] // Top-left corner
          colIds.forEach((colId: string) => {
            const crit = criteria.find((c: Criterion) => c.id === colId)
            headerRow.push(crit?.name || colId)
          })
          addRowWithBorder(headerRow, true, { isBold: true })

          rowIds.forEach((rowId: string) => {
            const rowCrit = criteria.find((c: Criterion) => c.id === rowId)
            const row = [rowCrit?.name || rowId]
            colIds.forEach((colId: string) => {
              row.push(valueAsObj[rowId][colId] ?? 0)
            })
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        })

        // Table 5: Influence (D) and Dependence (R) - Combined table
        if (metrics.dValues && metrics.rValues) {
          addRowWithBorder([`Table ${tableIndex}: Influence (D) and Dependence (R)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Sum of influence/dependence per criterion'], false)
          worksheet.addRow([])

          const headerRow = ['Criterion', 'Influence (D)', 'Dependence (R)']
          addRowWithBorder(headerRow, true, { isBold: true })

          criteria.forEach((crit: Criterion) => {
            const row = [
              crit.name,
              (metrics.dValues as Record<string, number>)[crit.id] ?? 0,
              (metrics.rValues as Record<string, number>)[crit.id] ?? 0
            ]
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 6: Prominence (P) and Relation (E) - Combined table
        if (metrics.pValues && metrics.eValues) {
          addRowWithBorder([`Table ${tableIndex}: Prominence (P) and Relation (E)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Causal analysis: P = D + R, E = D - R'], false)
          worksheet.addRow([])

          const headerRow = ['Criterion', 'Prominence (P)', 'Relation (E)']
          addRowWithBorder(headerRow, true, { isBold: true })

          criteria.forEach((crit: Criterion) => {
            const row = [
              crit.name,
              (metrics.pValues as Record<string, number>)[crit.id] ?? 0,
              (metrics.eValues as Record<string, number>)[crit.id] ?? 0
            ]
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 7: Final Weights (w_j) - Process LAST to match web UI
        if (metrics.weights) {
          const value = metrics.weights
          addRowWithBorder([`Table ${tableIndex}: Final Weights (w_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated DEMATEL Weights'], false)
          worksheet.addRow([])

          // Weights table (transposed - one row)
          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const weightsRow = criteria.map((c: Criterion) => (value as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(weightsRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        console.log('DEMATEL special handling complete - skipping generic processing')
        // Skip generic processing for DEMATEL
      } else if (weightMethod?.toLowerCase() === 'sd' && metrics) {
        console.log('SD special handling activated!')
        // SD shows 4 tables: Decision Matrix, Normalized Matrix, Sigma Values, Weights

        // Table 2: Normalized Matrix
        if (metrics.normalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix (r_ij)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Normalized values using Min-Max normalization'], false)
          worksheet.addRow([])

          const valueAsObj = metrics.normalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })

          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => {
              row.push(valueAsObj[alt.id]?.[c.id] ?? 0)
            })
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 3: Standard Deviations (Sigma Values)
        if (metrics.sigmaValues) {
          addRowWithBorder([`Table ${tableIndex}: Standard Deviation per Criterion (σ_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated standard deviation of normalized scores'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const sigmaRow = criteria.map((c: Criterion) => (metrics.sigmaValues as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(sigmaRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 4: Final Weights
        if (metrics.weights) {
          addRowWithBorder([`Table ${tableIndex}: Final Weights (w_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated SD Weights'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const weightsRow = criteria.map((c: Criterion) => (metrics.weights as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(weightsRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (weightMethod?.toLowerCase() === 'variance' && metrics) {
        console.log('Variance special handling activated!')
        // Variance shows 4 tables: Decision Matrix, Normalized Matrix, Variance Values, Weights

        // Table 2: Normalized Matrix
        if (metrics.normalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Normalized values'], false)
          worksheet.addRow([])

          const valueAsObj = metrics.normalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })

          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => {
              row.push(valueAsObj[alt.id]?.[c.id] ?? 0)
            })
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 3: Variance Values
        if (metrics.varianceValues) {
          addRowWithBorder([`Table ${tableIndex}: Variance per Criterion`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated variance of normalized scores'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const varianceRow = criteria.map((c: Criterion) => (metrics.varianceValues as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(varianceRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 4: Final Weights
        if (metrics.weights) {
          addRowWithBorder([`Table ${tableIndex}: Final Weights (w_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated Variance Weights'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const weightsRow = criteria.map((c: Criterion) => (metrics.weights as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(weightsRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (weightMethod?.toLowerCase() === 'equal' && metrics) {
        console.log('Equal Weights special handling activated!')
        // Equal Weights shows only 2 tables: Decision Matrix, Weights

        // Table 2: Final Weights (all equal)
        if (metrics.weights) {
          addRowWithBorder([`Table ${tableIndex}: Final Weights (w_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Equal weights for all criteria'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const weightsRow = criteria.map((c: Criterion) => (metrics.weights as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(weightsRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (weightMethod?.toLowerCase() === 'roc' && metrics) {
        console.log('ROC special handling activated!')
        // ROC shows 3 tables: Decision Matrix, Ranks, Weights

        // Table 2: Criteria Ranks
        if (metrics.ranks) {
          addRowWithBorder([`Table ${tableIndex}: Criteria Ranks`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Rank order of criteria'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const ranksRow = criteria.map((c: Criterion) => (metrics.ranks as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(ranksRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 3: Final Weights
        if (metrics.weights) {
          addRowWithBorder([`Table ${tableIndex}: Final Weights (w_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated ROC Weights'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const weightsRow = criteria.map((c: Criterion) => (metrics.weights as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(weightsRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (weightMethod?.toLowerCase() === 'rr' && metrics) {
        console.log('RR special handling activated!')
        // RR shows 3 tables: Decision Matrix, Ranks, Weights

        // Table 2: Criteria Ranks
        if (metrics.ranks) {
          addRowWithBorder([`Table ${tableIndex}: Criteria Ranks`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Rank order of criteria'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const ranksRow = criteria.map((c: Criterion) => (metrics.ranks as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(ranksRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 3: Final Weights
        if (metrics.weights) {
          addRowWithBorder([`Table ${tableIndex}: Final Weights (w_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated RR Weights'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const weightsRow = criteria.map((c: Criterion) => (metrics.weights as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(weightsRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (weightMethod?.toLowerCase() === 'entropy' && metrics) {
        console.log('Entropy special handling activated!')
        // Entropy shows 5 tables matching WEB UI EXACTLY

        // Table 2: Normalized Matrix
        if (metrics.normalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix (p_ij)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Normalized values using sum normalization'], false)
          worksheet.addRow([])

          const valueAsObj = metrics.normalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })

          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => {
              row.push(valueAsObj[alt.id]?.[c.id] ?? 0)
            })
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 3: Entropy Matrix
        if (metrics.entropyMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Entropy for Attributes (- (p_ij) * log2(p_ij) / log2(m))`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Intermediate entropy calculation values'], false)
          worksheet.addRow([])

          const valueAsObj = metrics.entropyMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })

          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => {
              row.push(valueAsObj[alt.id]?.[c.id] ?? 0)
            })
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          // Add Entropy (Ej) row at bottom if entropyValues exist
          if (metrics.entropyValues) {
            const entropyRow: (string | number)[] = ['Entropy (Ej)']
            criteria.forEach((c: Criterion) => {
              entropyRow.push((metrics.entropyValues as Record<string, number>)[c.id] ?? 0)
            })
            addRowWithBorder(entropyRow, true, { useNumFmt: true })
          }

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 4: Diversity Degree (d) - ONLY diversity, NOT combined with entropy
        if (metrics.diversityValues) {
          addRowWithBorder([`Table ${tableIndex}: Diversity Degree (d)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Degree of divergence (1 - Ej) per criterion'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const diversityRow = criteria.map((c: Criterion) => (metrics.diversityValues as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(diversityRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 5: Final Weights
        if (metrics.weights) {
          addRowWithBorder([`Table ${tableIndex}: Final Weights (Wj)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Normalized weights'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const weightsRow = criteria.map((c: Criterion) => (metrics.weights as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(weightsRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (weightMethod?.toLowerCase() === 'critic' && metrics) {
        console.log('CRITIC special handling activated! (Web UI Match)')
        // CRITIC shows 6 tables matching WEB UI EXACTLY

        // Table 2: Normalization
        if (metrics.normalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalization (r_ij)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Normalized decision matrix'], false)
          worksheet.addRow([])

          const valueAsObj = metrics.normalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })

          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => {
              row.push(valueAsObj[alt.id]?.[c.id] ?? 0)
            })
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 3: Standard Deviation (Horizontal Row in Web UI)
        if (metrics.standardDeviations) {
          addRowWithBorder([`Table ${tableIndex}: Standard Deviation (σ_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Contrast intensity of each criterion'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const sdRow = criteria.map((c: Criterion) => (metrics.standardDeviations as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(sdRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 4: Correlation Matrix
        if (metrics.correlationMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Correlation Matrix (r_jk)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Conflict between criteria'], false)
          worksheet.addRow([])

          const valueAsObj = metrics.correlationMatrix as Record<string, Record<string, number>>
          const headerRow = ['Criterion', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })

          criteria.forEach((rowCrit: Criterion) => {
            const row: (string | number)[] = [rowCrit.name]
            criteria.forEach((colCrit: Criterion) => {
              row.push(valueAsObj[rowCrit.id]?.[colCrit.id] ?? 0)
            })
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 5: Information Measure (Horizontal Row in Web UI)
        if (metrics.informationAmounts) {
          addRowWithBorder([`Table ${tableIndex}: Information Measure (Cj)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Amount of information contained in each criterion'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const infoRow = criteria.map((c: Criterion) => (metrics.informationAmounts as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(infoRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 6: Final Weights
        if (metrics.weights) {
          addRowWithBorder([`Table ${tableIndex}: Final Weights (Wj)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated CRITIC weights'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const weightsRow = criteria.map((c: Criterion) => (metrics.weights as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(weightsRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (weightMethod?.toLowerCase() === 'merec' && metrics) {
        console.log('MEREC special handling activated! (Web UI Match)')
        // MEREC shows 6 tables matching WEB UI EXACTLY

        // Table 2: Normalized Matrix
        if (metrics.normalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalize the decision matrix (r_ij)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Normalized values based on criteria type'], false)
          worksheet.addRow([])

          const valueAsObj = metrics.normalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })

          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => {
              row.push(valueAsObj[alt.id]?.[c.id] ?? 0)
            })
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 3: Overall Performance (S_i) - Vertical
        if (metrics.performanceScores) {
          addRowWithBorder([`Table ${tableIndex}: Overall performance of alternatives (S_i)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Performance score with all criteria'], false)
          worksheet.addRow([])

          const headerRow = ['Alternative', 'Performance Score (Si)']
          addRowWithBorder(headerRow, true, { isBold: true })

          alternatives.forEach((alt: Alternative) => {
            const score = (metrics.performanceScores as Record<string, number>)[alt.id] ?? 0
            const row = [alt.name, score]
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 4: Removal Scores (S_i^(-k)) - Matrix (Missing in original export)
        if (metrics.removalScores) {
          addRowWithBorder([`Table ${tableIndex}: Performance with removing each criterion (S_i^(-k))`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Scores calculated by removing one criterion at a time'], false)
          worksheet.addRow([])

          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => `Remove ${c.name}`)]
          addRowWithBorder(headerRow, true, { isBold: true })

          const valueAsObj = metrics.removalScores as Record<string, Record<string, number>>
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => {
              row.push(valueAsObj[alt.id]?.[c.id] ?? 0)
            })
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 5: Removal Effects (E_k) - Horizontal
        if (metrics.removalEffects) {
          addRowWithBorder([`Table ${tableIndex}: Removal effect of each criterion (E_k)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Sum of absolute deviations'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const effectsRow = criteria.map((c: Criterion) => (metrics.removalEffects as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(effectsRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 6: Final Weights (w_k) - Horizontal
        if (metrics.weights) {
          addRowWithBorder([`Table ${tableIndex}: Final Weights (w_k)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated MEREC Weights'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const weightsRow = criteria.map((c: Criterion) => (metrics.weights as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(weightsRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (weightMethod?.toLowerCase() === 'sd' && metrics) {
        console.log('SD special handling activated! (Web UI Match)')
        // SD shows 4 tables matching WEB UI EXACTLY

        // Table 2: Normalized Matrix
        if (metrics.normalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix (r_ij)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Normalized values using Min-Max normalization'], false)
          worksheet.addRow([])

          const valueAsObj = metrics.normalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })

          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => {
              row.push(valueAsObj[alt.id]?.[c.id] ?? 0)
            })
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 3: Standard Deviation (Horizontal Row)
        if (metrics.sigmaValues) {
          addRowWithBorder([`Table ${tableIndex}: Standard Deviation per Criterion (σ_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated standard deviation of normalized scores'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const sdRow = criteria.map((c: Criterion) => (metrics.sigmaValues as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(sdRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 4: Final Weights
        if (metrics.weights) {
          addRowWithBorder([`Table ${tableIndex}: Final Weights (w_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated SD Weights'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const weightsRow = criteria.map((c: Criterion) => (metrics.weights as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(weightsRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (weightMethod?.toLowerCase() === 'variance' && metrics) {
        console.log('Variance special handling activated! (Web UI Match)')
        // Variance shows 4 tables matching WEB UI EXACTLY

        // Table 2: Normalized Matrix
        if (metrics.normalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix (r_ij)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Normalized values using Min-Max normalization'], false)
          worksheet.addRow([])

          const valueAsObj = metrics.normalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })

          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => {
              row.push(valueAsObj[alt.id]?.[c.id] ?? 0)
            })
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 3: Variance Values (Horizontal Row)
        if (metrics.varianceValues) {
          addRowWithBorder([`Table ${tableIndex}: Statistical Variance per Criterion (σ²_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated variance of normalized scores'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const varRow = criteria.map((c: Criterion) => (metrics.varianceValues as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(varRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 4: Final Weights
        if (metrics.weights) {
          addRowWithBorder([`Table ${tableIndex}: Final Weights (w_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated Variance Weights'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const weightsRow = criteria.map((c: Criterion) => (metrics.weights as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(weightsRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (weightMethod?.toLowerCase() === 'mad' && metrics) {
        console.log('MAD special handling activated!')
        // MAD shows 4 tables

        // Table 2: Normalized Matrix
        if (metrics.normalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Sum normalization'], false)
          worksheet.addRow([])

          const valueAsObj = metrics.normalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })

          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => {
              row.push(valueAsObj[alt.id]?.[c.id] ?? 0)
            })
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 3: MAD Values
        if (metrics.madValues) {
          addRowWithBorder([`Table ${tableIndex}: Mean Absolute Deviation (MAD)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['MAD per criterion'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const madRow = criteria.map((c: Criterion) => (metrics.madValues as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(madRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 4: Final Weights
        if (metrics.weights) {
          addRowWithBorder([`Table ${tableIndex}: Final Weights (w_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated MAD Weights'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const weightsRow = criteria.map((c: Criterion) => (metrics.weights as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(weightsRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (weightMethod?.toLowerCase() === 'pcwm' && metrics) {
        console.log('PCWM special handling activated!')
        // PCWM shows 4 tables

        // Table 2: Normalized Matrix
        if (metrics.normalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Vector normalization'], false)
          worksheet.addRow([])

          const valueAsObj = metrics.normalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })

          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => {
              row.push(valueAsObj[alt.id]?.[c.id] ?? 0)
            })
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 3: Correlation Matrix
        if (metrics.correlationMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Pearson Correlation Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Correlation between criteria'], false)
          worksheet.addRow([])

          const valueAsObj = metrics.correlationMatrix as Record<string, Record<string, number>>
          const headerRow = ['', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })

          criteria.forEach((rowCrit: Criterion) => {
            const row: (string | number)[] = [rowCrit.name]
            criteria.forEach((colCrit: Criterion) => {
              row.push(valueAsObj[rowCrit.id]?.[colCrit.id] ?? 0)
            })
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 4: Independence Measures
        if (metrics.independenceMeasures) {
          addRowWithBorder([`Table ${tableIndex}: Independence Measures (Conflict)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Independence measure per criterion'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const indepRow = criteria.map((c: Criterion) => (metrics.independenceMeasures as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(indepRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 5: Final Weights
        if (metrics.weights) {
          addRowWithBorder([`Table ${tableIndex}: Final Weights (w_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated PCWM Weights'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const weightsRow = criteria.map((c: Criterion) => (metrics.weights as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(weightsRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (weightMethod?.toLowerCase() === 'ahp' && metrics) {
        console.log('AHP special handling activated! (Web UI Match)')
        // AHP shows only 2 tables in Web UI (Table 1: X, Table 2: AHP Results)

        // Table 2: AHP Calculation Results (Pairwise + Weights)
        if (metrics.pairwiseMatrix) {
          addRowWithBorder([`Table ${tableIndex}: AHP Weight Calculation Results`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])

          // Add stats in description line style
          const lambdaMax = metrics.lambdaMax as number
          const ci = metrics.consistencyIndex as number
          const cr = metrics.consistencyRatio as number
          addRowWithBorder([`λmax = ${lambdaMax?.toFixed(4)} | CI = ${ci?.toFixed(4)} | CR = ${cr?.toFixed(4)}`], false)
          worksheet.addRow([])

          const headerRow = ['Criteria', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })

          // Pairwise Matrix Rows
          // Note: metrics.pairwiseMatrix is number[][] in API usually
          const matrix = metrics.pairwiseMatrix as unknown as number[][]
          criteria.forEach((rowCrit: Criterion, i: number) => {
            const row: (string | number)[] = [rowCrit.name]
            criteria.forEach((colCrit: Criterion, j: number) => {
              if (Array.isArray(matrix) && Array.isArray(matrix[i])) {
                row.push(matrix[i][j] ?? 0)
              } else {
                // Fallback if structure is object-based
                const matObj = metrics.pairwiseMatrix as unknown as Record<string, Record<string, number>>
                row.push(matObj[rowCrit.id]?.[colCrit.id] ?? 0)
              }
            })
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          // Final Weights Row merged into this table at the bottom
          const weightsRow: (string | number)[] = ['Weights (Wj)']
          criteria.forEach((c: Criterion) => {
            weightsRow.push((metrics.weights as Record<string, number>)[c.id] ?? 0)
          })
          addRowWithBorder(weightsRow, true, { useNumFmt: true, isBold: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (weightMethod?.toLowerCase() === 'lopcow' && metrics) {
        console.log('LOPCOW special handling activated!')
        // LOPCOW shows 4 tables

        // Table 2: Normalized Matrix
        if (metrics.normalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Linear normalization'], false)
          worksheet.addRow([])

          const valueAsObj = metrics.normalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })

          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => {
              row.push(valueAsObj[alt.id]?.[c.id] ?? 0)
            })
            addRowWithBorder(row, true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 3: Geometric Means
        if (metrics.geometricMeans) {
          addRowWithBorder([`Table ${tableIndex}: Geometric Mean per Criterion`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Geometric mean of normalized values'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const gMeanRow = criteria.map((c: Criterion) => (metrics.geometricMeans as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(gMeanRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 4: Log Percentages
        if (metrics.logPercentages) {
          addRowWithBorder([`Table ${tableIndex}: Logarithmic Percentage Contribution`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Log percentage variation'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const logRow = criteria.map((c: Criterion) => (metrics.logPercentages as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(logRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 5: Final Weights
        if (metrics.weights) {
          addRowWithBorder([`Table ${tableIndex}: Final Weights (w_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated LOPCOW Weights'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const weightsRow = criteria.map((c: Criterion) => (metrics.weights as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(weightsRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (weightMethod?.toLowerCase() === 'swara' && metrics) {
        console.log('SWARA special handling activated!')
        // SWARA shows 4 tables

        // Table 2: Step Factors (s_j)
        if (metrics.stepFactors) {
          addRowWithBorder([`Table ${tableIndex}: Comparative Importance (s_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Relative importance step factors'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const stepRow = criteria.map((c: Criterion) => (metrics.stepFactors as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(stepRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 3: Coefficients (k_j)
        if (metrics.coefficients) {
          addRowWithBorder([`Table ${tableIndex}: Coefficients (k_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated coefficients k_j = 1 + s_j'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const coeffRow = criteria.map((c: Criterion) => (metrics.coefficients as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(coeffRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 4: Preliminary Weights (q_j)
        if (metrics.preliminaryWeights) {
          addRowWithBorder([`Table ${tableIndex}: Preliminary Weights (q_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Recalculated weights before normalization'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const prelRow = criteria.map((c: Criterion) => (metrics.preliminaryWeights as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(prelRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 5: Final Weights
        if (metrics.weights) {
          addRowWithBorder([`Table ${tableIndex}: Final Weights (w_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated SWARA Weights'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const weightsRow = criteria.map((c: Criterion) => (metrics.weights as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(weightsRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (isWeightExport && isPiprecia && metrics) {
        console.log('PIPRECIA special handling activated!')
        // PIPRECIA shows 4 tables

        // Table 2: s_values
        if (metrics.s_values) {
          addRowWithBorder([`Table ${tableIndex}: Criterion Importance (s_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Relative importance coefficients'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const sRow = criteria.map((c: Criterion) => (metrics.s_values as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(sRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 3: k_values
        if (metrics.k_values) {
          addRowWithBorder([`Table ${tableIndex}: Coefficient (k_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated coefficients'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const kRow = criteria.map((c: Criterion) => (metrics.k_values as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(kRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 4: q_values
        if (metrics.q_values) {
          addRowWithBorder([`Table ${tableIndex}: Relative Weight (q_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Preliminary relative weights'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const qRow = criteria.map((c: Criterion) => (metrics.q_values as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(qRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 5: Final Weights
        if (metrics.weights) {
          addRowWithBorder([`Table ${tableIndex}: Final Weights (w_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Calculated PIPRECIA Weights'], false)
          worksheet.addRow([])

          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })

          const weightsRow = criteria.map((c: Criterion) => (metrics.weights as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(weightsRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (isWeightExport && isLpwm && metrics) {
        console.log('LPWM special handling activated!')
        // ... (as before, but ensuring logic is sound)
        if (metrics.normalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix (n_ij)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.normalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        if (metrics.antiIdealValues && metrics.lowerDeviationValues) {
          addRowWithBorder([`Table ${tableIndex}: Anti-Ideal Values (A*) and Lower Deviations (LD_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const headerRow = ['Metric', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          const antiIdealRow: (string | number)[] = ['Anti-Ideal (A*)']
          criteria.forEach((c: Criterion) => antiIdealRow.push((metrics.antiIdealValues as Record<string, number>)[c.id] ?? 0))
          addRowWithBorder(antiIdealRow, true, { useNumFmt: true })
          const deviationRow: (string | number)[] = ['Lower Deviation (LD_j)']
          criteria.forEach((c: Criterion) => deviationRow.push((metrics.lowerDeviationValues as Record<string, number>)[c.id] ?? 0))
          addRowWithBorder(deviationRow, true, { useNumFmt: true })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        if (metrics.weights) {
          addRowWithBorder([`Table ${tableIndex}: Final Weights (w_j)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })
          const weightsRow = criteria.map((c: Criterion) => (metrics.weights as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(weightsRow, true, { useNumFmt: true })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isTopsis && metrics) {
        console.log('TOPSIS special handling activated!')
        // Table 2: Normalized
        const normKey = metrics.topsisNormalizedMatrix ? 'topsisNormalizedMatrix' : (metrics.normalizedMatrix ? 'normalizedMatrix' : null)
        if (normKey) {
          addRowWithBorder([`Table ${tableIndex}: Topsis Normalized Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics[normKey] as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 3: Weighted
        const weightKey = metrics.topsisWeightedMatrix ? 'topsisWeightedMatrix' : (metrics.weightedMatrix ? 'weightedMatrix' : null)
        if (weightKey) {
          addRowWithBorder([`Table ${tableIndex}: Topsis Weighted Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics[weightKey] as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 4: Ideal SOLUTIONS (Combined)
        const pis = metrics.topsisIdealBest || metrics.idealBest || metrics.idealSolution
        const nis = metrics.topsisIdealWorst || metrics.idealWorst || metrics.antiIdealSolution
        if (pis && nis) {
          addRowWithBorder([`Table ${tableIndex}: Positive and Negative Ideal Solutions`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const headerRow = ['Metric', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          const pisRow: (string | number)[] = ['PIS (A+)']
          criteria.forEach((c: Criterion) => pisRow.push(pis[c.id] ?? 0))
          addRowWithBorder(pisRow, true, { useNumFmt: true })
          const nisRow: (string | number)[] = ['NIS (A-)']
          criteria.forEach((c: Criterion) => nisRow.push(nis[c.id] ?? 0))
          addRowWithBorder(nisRow, true, { useNumFmt: true })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

        // Table 5: Separation Measures
        if (metrics.topsisDistances) {
          addRowWithBorder([`Table ${tableIndex}: Separation Measures`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Distances to Positive (D+) and Negative (D-) Ideal Solutions'], false, { alignment: { horizontal: "left" } })
          worksheet.addRow([])

          const headerRow = ['Alternative', 'D+ (Distance to Best)', 'D- (Distance to Worst)']
          addRowWithBorder(headerRow, true, { isBold: true })

          alternatives.forEach((alt: Alternative) => {
            const dist = (metrics.topsisDistances as Record<string, any>)[alt.id]
            addRowWithBorder([alt.name, dist?.positive ?? 0, dist?.negative ?? 0], true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isAras && metrics) {
        console.log('ARAS special handling activated!')
        // Table 3: Normalized Matrix
        if (metrics.arasNormalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.arasNormalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 4: Weighted Matrix
        if (metrics.arasWeightedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Weighted Normalized Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.arasWeightedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 5: Optimality & Utility
        if (metrics.arasOptimalityFunctionValues) {
          addRowWithBorder([`Table ${tableIndex}: Optimality Function & Utility`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          addRowWithBorder(['Si (Optimality Function) and Ki (Degree of Utility)'], false, { alignment: { horizontal: "left" } })
          worksheet.addRow([])

          const headerRow = ['Alternative', 'Optimality Function (Si)', 'Degree of Utility (Ki)']
          addRowWithBorder(headerRow, true, { isBold: true })

          alternatives.forEach((alt: Alternative) => {
            const si = (metrics.arasOptimalityFunctionValues as Record<string, number>)[alt.id] ?? 0
            const ki = body.ranking.find((r: any) => r.alternativeName === alt.name)?.score ?? 0
            addRowWithBorder([alt.name, si, ki], true, { useNumFmt: true })
          })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isCopras && metrics) {
        console.log('COPRAS special handling activated!')
        // Table 3: Normalized Matrix
        if (metrics.coprasNormalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.coprasNormalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 4: Weighted Matrix
        if (metrics.coprasWeightedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Weighted Normalized Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.coprasWeightedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 5: Significance and Priority
        if (metrics.coprasSPlus && metrics.coprasSMinus && metrics.coprasQi) {
          addRowWithBorder([`Table ${tableIndex}: Significance and Priority`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const headerRow = ['Alternative', 'S+', 'S-', 'Qi (Score)']
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const sPlus = (metrics.coprasSPlus as Record<string, number>)[alt.id] ?? 0
            const sMinus = (metrics.coprasSMinus as Record<string, number>)[alt.id] ?? 0
            const qi = (metrics.coprasQi as Record<string, number>)[alt.id] ?? 0
            addRowWithBorder([alt.name, sPlus, sMinus, qi], true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isEdas && metrics) {
        console.log('EDAS special handling activated!')
        // Table 3: Average Solution
        if (metrics.edasAvVector) {
          addRowWithBorder([`Table ${tableIndex}: Average Solution (AV)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const headerRow = criteria.map((c: Criterion) => c.name)
          addRowWithBorder(headerRow, true, { isBold: true })
          const avRow = criteria.map((c: Criterion) => (metrics.edasAvVector as Record<string, number>)[c.id] ?? 0)
          addRowWithBorder(avRow, true, { useNumFmt: true })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 4: PDA Matrix
        if (metrics.edasPdaMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Positive Distance from Average (PDA)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.edasPdaMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 5: NDA Matrix
        if (metrics.edasNdaMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Negative Distance from Average (NDA)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.edasNdaMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 6: EDAS Scores Breakdown
        if (metrics.edasSpValues && metrics.edasSnValues && metrics.edasNspValues && metrics.edasNsnValues && metrics.edasAsValues) {
          addRowWithBorder([`Table ${tableIndex}: EDAS Scores Breakdown`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const headerRow = ['Alternative', 'SP', 'SN', 'NSP', 'NSN', 'AS Score']
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const sp = (metrics.edasSpValues as Record<string, number>)[alt.id] ?? 0
            const sn = (metrics.edasSnValues as Record<string, number>)[alt.id] ?? 0
            const nsp = (metrics.edasNspValues as Record<string, number>)[alt.id] ?? 0
            const nsn = (metrics.edasNsnValues as Record<string, number>)[alt.id] ?? 0
            const as = (metrics.edasAsValues as Record<string, number>)[alt.id] ?? 0
            addRowWithBorder([alt.name, sp, sn, nsp, nsn, as], true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isVikor && metrics) {
        console.log('VIKOR special handling activated!')
        // Table 3: Normalized Matrix
        if (metrics.vikorNormalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.vikorNormalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 4: Best and Worst Values
        if (metrics.vikorFBest && metrics.vikorFWorst) {
          addRowWithBorder([`Table ${tableIndex}: Best and Worst Values`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const headerRow = ['Value Type', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          const fBestRow = ['f* (Best)', ...criteria.map((c: Criterion) => (metrics.vikorFBest as Record<string, number>)[c.id] ?? 0)]
          addRowWithBorder(fBestRow, true, { useNumFmt: true })
          const fWorstRow = ['f- (Worst)', ...criteria.map((c: Criterion) => (metrics.vikorFWorst as Record<string, number>)[c.id] ?? 0)]
          addRowWithBorder(fWorstRow, true, { useNumFmt: true })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 5: VIKOR Values (S, R, Q)
        if (metrics.vikorSValues && metrics.vikorRValues && metrics.vikorQValues) {
          addRowWithBorder([`Table ${tableIndex}: VIKOR Values (S, R, Q)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const headerRow = ['Alternative', 'S Value', 'R Value', 'Q Value']
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const s = (metrics.vikorSValues as Record<string, number>)[alt.id] ?? 0
            const r = (metrics.vikorRValues as Record<string, number>)[alt.id] ?? 0
            const q = (metrics.vikorQValues as Record<string, number>)[alt.id] ?? 0
            addRowWithBorder([alt.name, s, r, q], true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isWaspas && metrics) {
        console.log('WASPAS special handling activated!')
        // Table 2: Normalized Matrix
        if (metrics.waspasNormalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.waspasNormalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 3: WSM Matrix
        if (metrics.waspasWsmMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Weighted Sum Model (WSM)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.waspasWsmMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 4: WPM Matrix
        if (metrics.waspasWpmMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Weighted Product Model (WPM)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.waspasWpmMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 5: Aggregated Scores
        if (metrics.waspasWsmScores && metrics.waspasWpmScores) {
          addRowWithBorder([`Table ${tableIndex}: Aggregated WASPAS Scores`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const headerRow = ['Alternative', 'Total WSM', 'Total WPM', 'WASPAS Score (Q)']
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const wsm = (metrics.waspasWsmScores as Record<string, number>)[alt.id] ?? 0
            const wpm = (metrics.waspasWpmScores as Record<string, number>)[alt.id] ?? 0
            const q = body.ranking.find((r: any) => r.alternativeId === alt.id)?.score ?? 0
            addRowWithBorder([alt.name, wsm, wpm, q], true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isMabac && metrics) {
        console.log('MABAC special handling activated!')
        // Table 2: Normalized Matrix
        if (metrics.mabacNormalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.mabacNormalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 3: Weighted Matrix
        if (metrics.mabacWeightedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Weighted Matrix (V)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.mabacWeightedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 4: Border Approximation Area (BAA)
        if (metrics.mabacBorderApproximationArea) {
          addRowWithBorder([`Table ${tableIndex}: Border Approximation Area (BAA)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.mabacBorderApproximationArea as Record<string, number>
          const headerRow = ['Metric', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          const row: (string | number)[] = ['BAA (G)']
          criteria.forEach((c: Criterion) => row.push(valueAsObj[c.id] ?? 0))
          addRowWithBorder(row, true, { useNumFmt: true })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 5: Distance Matrix
        if (metrics.mabacDistanceMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Distance Matrix (Q)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.mabacDistanceMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isElectre && metrics) {
        console.log('ELECTRE special handling activated!')
        // Table 2: Normalized Matrix
        const normalizedMatrix = metrics.electreNormalizedMatrix || metrics.electre1NormalizedMatrix || metrics.electre2NormalizedMatrix
        if (normalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = normalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 3: Concordance Matrix
        const concordanceMatrix = metrics.electreConcordanceMatrix || metrics.electre1ConcordanceMatrix || metrics.electre2ConcordanceMatrix
        if (concordanceMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Concordance Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = concordanceMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alt \\ Alt', ...alternatives.map((a: Alternative) => a.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((rowAlt: Alternative) => {
            const row: (string | number)[] = [rowAlt.name]
            alternatives.forEach((colAlt: Alternative) => row.push(valueAsObj[rowAlt.id]?.[colAlt.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 4: Discordance Matrix
        const discordanceMatrix = metrics.electreDiscordanceMatrix || metrics.electre1DiscordanceMatrix || metrics.electre2DiscordanceMatrix
        if (discordanceMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Discordance Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = discordanceMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alt \\ Alt', ...alternatives.map((a: Alternative) => a.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((rowAlt: Alternative) => {
            const row: (string | number)[] = [rowAlt.name]
            alternatives.forEach((colAlt: Alternative) => row.push(valueAsObj[rowAlt.id]?.[colAlt.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 5: Outranking Matrix (Basic or ELECTRE I)
        const outrankingMatrix = metrics.electreOutrankingMatrix || metrics.electre1OutrankingMatrix
        if (outrankingMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Outranking Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = outrankingMatrix as Record<string, Record<string, boolean>>
          const headerRow = ['Alt \\ Alt', ...alternatives.map((a: Alternative) => a.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((rowAlt: Alternative) => {
            const row: (string | number)[] = [rowAlt.name]
            alternatives.forEach((colAlt: Alternative) => row.push(valueAsObj[rowAlt.id]?.[colAlt.id] ? "Yes" : "No"))
            addRowWithBorder(row, true)
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 5/6: Strong Outranking Matrix (ELECTRE II)
        if (metrics.electre2StrongOutrankingMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Strong Outranking Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.electre2StrongOutrankingMatrix as Record<string, Record<string, boolean>>
          const headerRow = ['Alt \\ Alt', ...alternatives.map((a: Alternative) => a.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((rowAlt: Alternative) => {
            const row: (string | number)[] = [rowAlt.name]
            alternatives.forEach((colAlt: Alternative) => row.push(valueAsObj[rowAlt.id]?.[colAlt.id] ? "Yes" : "No"))
            addRowWithBorder(row, true)
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 6/7: Weak Outranking Matrix (ELECTRE II)
        if (metrics.electre2WeakOutrankingMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Weak Outranking Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.electre2WeakOutrankingMatrix as Record<string, Record<string, boolean>>
          const headerRow = ['Alt \\ Alt', ...alternatives.map((a: Alternative) => a.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((rowAlt: Alternative) => {
            const row: (string | number)[] = [rowAlt.name]
            alternatives.forEach((colAlt: Alternative) => row.push(valueAsObj[rowAlt.id]?.[colAlt.id] ? "Yes" : "No"))
            addRowWithBorder(row, true)
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isMarcos && metrics) {
        console.log('MARCOS special handling activated!')
        // Table 2: Normalized Matrix
        if (metrics.marcosNormalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.marcosNormalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 3: Weighted Matrix
        if (metrics.marcosWeightedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Weighted Normalized Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.marcosWeightedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 4: Ideal and Anti-Ideal Solutions
        if (metrics.marcosIdealSolution && metrics.marcosAntiIdealSolution) {
          addRowWithBorder([`Table ${tableIndex}: Ideal and Anti-Ideal Solutions`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const headerRow = ['Solution', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })

          const idealRow: (string | number)[] = ['Ideal (AI)']
          const antiIdealRow: (string | number)[] = ['Anti-Ideal (AAI)']
          criteria.forEach((c: Criterion) => {
            idealRow.push((metrics.marcosIdealSolution as Record<string, number>)[c.id] ?? 0)
            antiIdealRow.push((metrics.marcosAntiIdealSolution as Record<string, number>)[c.id] ?? 0)
          })
          addRowWithBorder(idealRow, true, { useNumFmt: true })
          addRowWithBorder(antiIdealRow, true, { useNumFmt: true })

          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 5: Utility Degrees and Final Score
        if (metrics.marcosUtilityDegrees || metrics.marcosKMinus || metrics.marcosKPlus) {
          addRowWithBorder([`Table ${tableIndex}: Utility Degrees`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const headerRow = ['Alternative', 'K- (vs Ideal)', 'K+ (vs Anti-Ideal)', 'Utility Score (f(K))']
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const km = (metrics.marcosKMinus as Record<string, number>)?.[alt.id] ?? 0
            const kp = (metrics.marcosKPlus as Record<string, number>)?.[alt.id] ?? 0
            const score = (metrics.marcosUtilityDegrees as Record<string, number>)?.[alt.id] ?? body.ranking.find((r: any) => r.alternativeId === alt.id)?.score ?? 0
            addRowWithBorder([alt.name, km, kp, score], true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isMoosra && metrics) {
        console.log('MOOSRA special handling activated!')
        // Table 2: Normalized Matrix
        if (metrics.moosraNormalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.moosraNormalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 3: Weighted Matrix
        if (metrics.moosraWeightedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Weighted Normalized Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.moosraWeightedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 4: MOOSRA Scores Breakdown
        if (metrics.moosraBeneficialSum && metrics.moosraNonBeneficialSum) {
          addRowWithBorder([`Table ${tableIndex}: MOOSRA Scores Breakdown`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const headerRow = ['Alternative', 'Beneficial Sum', 'Non-Beneficial Sum', 'MOOSRA Score']
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const bSum = (metrics.moosraBeneficialSum as Record<string, number>)[alt.id] ?? 0
            const nbSum = (metrics.moosraNonBeneficialSum as Record<string, number>)[alt.id] ?? 0
            const score = body.ranking.find((r: any) => r.alternativeId === alt.id)?.score ?? 0
            addRowWithBorder([alt.name, bSum, nbSum, score], true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isCodas && metrics) {
        console.log('CODAS special handling activated!')
        // Table 2: Normalized Matrix
        if (metrics.codasNormalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.codasNormalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 3: Negative Ideal Solution
        if (metrics.codasNegativeIdealSolution) {
          addRowWithBorder([`Table ${tableIndex}: Negative Ideal Solution (NIS)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.codasNegativeIdealSolution as Record<string, number>
          const headerRow = ['Metric', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          const row: (string | number)[] = ['NIS']
          criteria.forEach((c: Criterion) => row.push(valueAsObj[c.id] ?? 0))
          addRowWithBorder(row, true, { useNumFmt: true })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 4: Distances and RA Scores
        if (metrics.codasEuclideanDistances && metrics.codasTaxicabDistances) {
          addRowWithBorder([`Table ${tableIndex}: CODAS Distances and Assessment`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const headerRow = ['Alternative', 'Euclidean Distance (Ei)', 'Taxicab Distance (Ti)', 'Relative Assessment (RA) Score']
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const ei = (metrics.codasEuclideanDistances as Record<string, number>)[alt.id] ?? 0
            const ti = (metrics.codasTaxicabDistances as Record<string, number>)[alt.id] ?? 0
            const score = body.ranking.find((r: any) => r.alternativeId === alt.id)?.score ?? 0
            addRowWithBorder([alt.name, ei, ti, score], true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isMairca && metrics) {
        console.log('MAIRCA special handling activated!')
        // Table 2: Normalized Matrix
        if (metrics.maircaNormalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.maircaNormalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 3: Theoretical Ratings
        if (metrics.maircaTheoreticalRatings) {
          addRowWithBorder([`Table ${tableIndex}: Theoretical Ratings (Tp)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.maircaTheoreticalRatings as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 4: Real Ratings
        if (metrics.maircaRealRatings) {
          addRowWithBorder([`Table ${tableIndex}: Real Ratings (Tr)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.maircaRealRatings as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 5: Gap Matrix
        if (metrics.maircaGapMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Gap Matrix (G)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.maircaGapMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 6: Total Gaps and Final Score
        if (metrics.maircaTotalGaps) {
          addRowWithBorder([`Table ${tableIndex}: Total Gaps & Final Score`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const headerRow = ['Alternative', 'Total Gap', 'Rank']
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const gap = (metrics.maircaTotalGaps as Record<string, number>)[alt.id] ?? 0
            const rank = body.ranking.find((r: any) => r.alternativeId === alt.id)?.rank ?? 0
            addRowWithBorder([alt.name, gap, rank], true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isMultimoora && metrics) {
        console.log('MULTIMOORA special handling activated!')
        // Table 2: Normalized Matrix
        if (metrics.multimooraNormalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.multimooraNormalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 3: Weighted Matrix
        if (metrics.multimooraWeightedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Weighted Normalized Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.multimooraWeightedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 4: MULTIMOORA Scores and Rankings Breakdown
        if (metrics.multimooraRatioSystemScores && metrics.multimooraReferencePointScores && metrics.multimooraFullMultiplicativeScores) {
          addRowWithBorder([`Table ${tableIndex}: MULTIMOORA Scores & Rankings`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const header1 = ['Alternative', 'Ratio System (RS)', '', 'Reference Point (RP)', '', 'Full Multiplicative (FMF)', '']
          const header2 = ['', 'Score', 'Rank', 'Score (Min)', 'Rank', 'Score', 'Rank']
          addRowWithBorder(header1, true, { isBold: true })
          addRowWithBorder(header2, true, { isBold: true })

          alternatives.forEach((alt: Alternative) => {
            const rsScore = (metrics.multimooraRatioSystemScores as Record<string, number>)[alt.id] ?? 0
            const rsRank = (metrics.multimooraRatioSystemRanking as Record<string, number>)[alt.id] ?? 0
            const rpScore = (metrics.multimooraReferencePointScores as Record<string, number>)[alt.id] ?? 0
            const rpRank = (metrics.multimooraReferencePointRanking as Record<string, number>)[alt.id] ?? 0
            const fmfScore = (metrics.multimooraFullMultiplicativeScores as Record<string, number>)[alt.id] ?? 0
            const fmfRank = (metrics.multimooraFullMultiplicativeRanking as Record<string, number>)[alt.id] ?? 0

            addRowWithBorder([alt.name, rsScore, rsRank, rpScore, rpRank, fmfScore, fmfRank], true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isGra && metrics) {
        console.log('GRA special handling activated!')
        // Table 2: Normalized Matrix
        if (metrics.graNormalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.graNormalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 3: Deviation Sequence
        if (metrics.graDeviationSequence) {
          addRowWithBorder([`Table ${tableIndex}: Deviation Sequence (Δij)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.graDeviationSequence as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 4: Grey Relational Coefficients
        if (metrics.graGreyRelationalCoefficients) {
          addRowWithBorder([`Table ${tableIndex}: Grey Relational Coefficients (ξij)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.graGreyRelationalCoefficients as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isCocoso && metrics) {
        console.log('COCOSO special handling activated!')
        // Table 2: Normalized Matrix
        if (metrics.cocosoNormalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.cocosoNormalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 3: Comparability Sequences
        if (metrics.cocosoWeightedComparabilitySum && metrics.cocosoWeightedComparabilityPower) {
          addRowWithBorder([`Table ${tableIndex}: Comparability Sequences`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const headerRow = ['Alternative', 'Weighted Sum (Si)', 'Weighted Power (Pi)']
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const si = (metrics.cocosoWeightedComparabilitySum as Record<string, number>)[alt.id] ?? 0
            const pi = (metrics.cocosoWeightedComparabilityPower as Record<string, number>)[alt.id] ?? 0
            addRowWithBorder([alt.name, si, pi], true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 4: Aggregation Strategies
        if (metrics.cocosoKia && metrics.cocosoKib && metrics.cocosoKic) {
          addRowWithBorder([`Table ${tableIndex}: Aggregation Strategies & Final Score`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const headerRow = ['Alternative', 'Kia', 'Kib', 'Kic', 'Final Score (Ki)']
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const kia = (metrics.cocosoKia as Record<string, number>)[alt.id] ?? 0
            const kib = (metrics.cocosoKib as Record<string, number>)[alt.id] ?? 0
            const kic = (metrics.cocosoKic as Record<string, number>)[alt.id] ?? 0
            const score = body.ranking.find((r: any) => r.alternativeId === alt.id)?.score ?? 0
            addRowWithBorder([alt.name, kia, kib, kic, score], true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isTodim && metrics) {
        console.log('TODIM special handling activated!')
        // Table 2: Normalized Matrix
        if (metrics.todimNormalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.todimNormalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 3: Relative Weights
        if (metrics.todimRelativeWeights) {
          addRowWithBorder([`Table ${tableIndex}: Relative Weights (wrk)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.todimRelativeWeights as Record<string, number>
          const headerRow = ['Metric', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          const row: (string | number)[] = ['Relative Weight']
          criteria.forEach((c: Criterion) => row.push(valueAsObj[c.id] ?? 0))
          addRowWithBorder(row, true, { useNumFmt: true })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 4: Dominance Matrix
        if (metrics.todimDominanceMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Dominance Matrix (δ)`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.todimDominanceMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alt \\ Alt', ...alternatives.map((a: Alternative) => a.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((rowAlt: Alternative) => {
            const row: (string | number)[] = [rowAlt.name]
            alternatives.forEach((colAlt: Alternative) => row.push(valueAsObj[rowAlt.id]?.[colAlt.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isSwei && metrics) {
        console.log('SWEI special handling activated!')
        // Table 2: Normalized Matrix
        if (metrics.sweiNormalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.sweiNormalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 3: Information Matrix
        if (metrics.sweiInformationMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Information Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.sweiInformationMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 4: Weighted Exponential Matrix
        if (metrics.sweiWeightedExponentialMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Weighted Exponential Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.sweiWeightedExponentialMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isSwi && metrics) {
        console.log('SWI special handling activated!')
        // Table 2: Normalized Matrix
        if (metrics.swiNormalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.swiNormalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 3: Information Matrix
        if (metrics.swiInformationMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Information Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.swiInformationMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 4: Weighted Information Matrix
        if (metrics.swiWeightedInformationMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Weighted Information Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = metrics.swiWeightedInformationMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else if (!isWeightExport && isPromethee && metrics) {
        console.log('PROMETHEE special handling activated!')
        // Table 2: Normalized Matrix
        const normalizedMatrix = metrics.prometheeNormalizedMatrix || metrics.promethee1NormalizedMatrix || metrics.promethee2NormalizedMatrix
        if (normalizedMatrix) {
          addRowWithBorder([`Table ${tableIndex}: Normalized Decision Matrix`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const valueAsObj = normalizedMatrix as Record<string, Record<string, number>>
          const headerRow = ['Alternative', ...criteria.map((c: Criterion) => c.name)]
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const row: (string | number)[] = [alt.name]
            criteria.forEach((c: Criterion) => row.push(valueAsObj[alt.id]?.[c.id] ?? 0))
            addRowWithBorder(row, true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }
        // Table 3: Preference Flows
        const phiPlus = metrics.prometheePhiPlus || metrics.promethee1PositiveFlow || metrics.promethee2PositiveFlow
        const phiMinus = metrics.prometheePhiMinus || metrics.promethee1NegativeFlow || metrics.promethee2NegativeFlow
        const netFlow = metrics.prometheeNetFlow
        if (phiPlus && phiMinus) {
          addRowWithBorder([`Table ${tableIndex}: Preference Flows`], false, { isBold: true, alignment: { horizontal: "left" } })
          worksheet.addRow([])
          const headerRow = ['Alternative', 'Positive Flow (Φ+)', 'Negative Flow (Φ-)', 'Net Flow (Φ)']
          addRowWithBorder(headerRow, true, { isBold: true })
          alternatives.forEach((alt: Alternative) => {
            const p = (phiPlus as Record<string, number>)[alt.id] ?? 0
            const m = (phiMinus as Record<string, number>)[alt.id] ?? 0
            const n = (netFlow as Record<string, number>)?.[alt.id] ?? (p - m)
            addRowWithBorder([alt.name, p, m, n], true, { useNumFmt: true })
          })
          worksheet.addRow([])
          worksheet.addRow([])
          tableIndex++
        }

      } else {
        // Only process generic metrics if NOT in special handling

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
          k.toLowerCase().includes('consistency') ||
          k.toLowerCase().includes('ideal') ||
          k.toLowerCase().includes('solution') ||
          k.toLowerCase().includes('best') ||
          k.toLowerCase().includes('worst') ||
          k.toLowerCase().includes('effect') ||
          k.toLowerCase().includes('mean') ||
          k.toLowerCase().includes('percentage') ||
          k.toLowerCase().includes('factor') ||
          k.toLowerCase().includes('coefficient') ||
          k.toLowerCase().includes('rank') ||
          k.toLowerCase().includes('lambda')
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

          // Handle Scalars (like Consistency Ratio, Lambda Max, CI)
          if (key === 'consistencyRatio' && typeof value === 'number') {
            addRowWithBorder([`Consistency Ratio (CR): ${value.toFixed(resultsDecimalPlaces)}`], true, { isBold: true })
            worksheet.addRow([])
            return
          }

          if (key === 'lambdaMax' && typeof value === 'number') {
            addRowWithBorder([`Maximum Eigenvalue (λ_max): ${value.toFixed(resultsDecimalPlaces)}`], true, { isBold: true })
            worksheet.addRow([])
            return
          }

          if (key === 'consistencyIndex' && typeof value === 'number') {
            addRowWithBorder([`Consistency Index (CI): ${value.toFixed(resultsDecimalPlaces)}`], true, { isBold: true })
            worksheet.addRow([])
            return
          }

          if (value && typeof value === 'object' && !Array.isArray(value)) {
            let tableName = key.replace(/([A-Z])/g, ' $1').trim().replace(/^[a-z]/, (char) => char.toUpperCase())
            let rowHeader = tableName

            const methodLower = (method || '').toLowerCase()
            const isTopsis = methodLower.includes('topsis')
            const isMarcos = methodLower.includes('marcos')
            const isEdas = methodLower.includes('edas')
            const isEntropy = methodLower.includes('entropy')
            const isCritic = methodLower.includes('critic')

            if (key === 'weights' || key === 'weightsWj') {
              tableName = 'Final Weights'
              rowHeader = 'Weights'
            } else if (key === 'idealBest' || key === 'idealSolution') {
              tableName = isTopsis ? 'Positive Ideal Solution (PIS)' : (isMarcos ? 'Ideal Solution (AI)' : 'Positive Ideal Solution')
              rowHeader = isTopsis ? 'PIS (A+)' : (isMarcos ? 'AI' : 'Ideal')
            } else if (key === 'idealWorst' || key === 'antiIdealSolution') {
              tableName = isTopsis ? 'Negative Ideal Solution (NIS)' : (isMarcos ? 'Anti-Ideal Solution (AAI)' : 'Negative Ideal Solution')
              rowHeader = isTopsis ? 'NIS (A-)' : (isMarcos ? 'AAI' : 'Anti-Ideal')
            } else if (key === 'avVector' || key === 'averageSolution') {
              tableName = 'Average Solution'
              rowHeader = 'AV'
            } else if (key === 'diversityValues') {
              tableName = 'Diversity Degree'
              rowHeader = 'Diversity Degree'
            } else if (key === 'normalizedMatrix') {
              tableName = isEntropy ? 'Normalized Decision Matrix' : (isCritic ? 'Normalization (r_ij)' : (isTopsis ? 'Topsis Normalized Matrix' : 'Normalized Decision Matrix'))
            } else if (key === 'weightedMatrix') {
              tableName = isTopsis ? 'Topsis Weighted Matrix' : 'Weighted Normalized Matrix'
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
            } else if (key === 'performanceScores') {
              tableName = 'Performance Scores'
              rowHeader = 'Alternative'
            } else if (key === 'removalScores') {
              tableName = 'Removal Scores'
            } else if (key === 'removalEffects') {
              tableName = 'Removal Effect of each criterion (E_k)'
              rowHeader = 'Removal Effect'
            } else if (key === 'geometricMeans') {
              tableName = 'Geometric Means (GM_j)'
              rowHeader = 'Geometric Mean'
            } else if (key === 'logPercentages') {
              tableName = 'Logarithmic Percentage Changes (L_j)'
              rowHeader = 'L Value'
            } else if (key === 'stepFactors') {
              tableName = 'Step Factors (k_j)'
              rowHeader = 'k Factor'
            } else if (key === 'preliminaryWeights') {
              tableName = 'Preliminary Weights (q_j)'
              rowHeader = 'q'
            } else if (key === 'coefficients') {
              tableName = 'Comparative Importance Coefficients (s_j)'
              rowHeader = 's Coefficient'
            } else if (key === 's_values') {
              tableName = 'S Values'
              rowHeader = 's'
            } else if (key === 'k_values') {
              tableName = 'K Values'
              rowHeader = 'k'
            } else if (key === 'q_values') {
              tableName = 'Q Values'
              rowHeader = 'q'
            } else if (key === 'directRelationMatrix') {
              tableName = 'Direct Relation Matrix (A)'
            } else if (key === 'totalRelationMatrix') {
              tableName = 'Total Relation Matrix (T)'
            } else if (key === 'dValues') {
              tableName = 'Sent Influence (D)'
              rowHeader = 'D Value'
            } else if (key === 'rValues') {
              tableName = 'Received Influence (R)'
              rowHeader = 'R Value'
            } else if (key === 'pValues') {
              tableName = 'Prominence (P = D + R)'
              rowHeader = 'P Value'
            } else if (key === 'eValues') {
              tableName = 'Relation (E = D - R)'
              rowHeader = 'E Value'
            } else if (key === 'lambdaMax') {
              tableName = 'Maximum Eigenvalue (λ_max)'
              rowHeader = 'λ_max'
            } else if (key === 'consistencyIndex') {
              tableName = 'Consistency Index (CI)'
              rowHeader = 'CI'
            } else if (key === 'ranks') {
              tableName = 'Criteria Ranks'
              rowHeader = 'Rank'
            } else if (key === 'means') {
              tableName = 'Mean Values'
              rowHeader = 'Mean'
            } else if (key === 'madValues') {
              tableName = 'Mean Absolute Deviation (MAD)'
              rowHeader = 'MAD'
            } else if (key === 'independenceMeasures') {
              tableName = 'Independence Measures (Conflict)'
              rowHeader = 'Independence'
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
                  const crit = criteria.find((c: Criterion) => c.id === cid)
                  return crit ? getCriterionHeader(crit) : cid
                })
              ]
              addRowWithBorder(headerRow, true, { isBold: true })

              rowIds.forEach((rid: string) => {
                const row: (string | number)[] = [
                  isCriterionMatrix ? (criteria.find((c: Criterion) => c.id === rid)?.name || rid) : (alternatives.find((a: Alternative) => a.id === rid)?.name || rid)
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
      } // End of else block for non-DEMATEL methods
    } // End of if (metrics)

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
