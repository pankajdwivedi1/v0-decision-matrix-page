# MCDM Weight Methods Export Testing Checklist
**Project:** Decision Matrix Application  
**Test Date:** 2026-01-27  
**Prepared By:** Antigravity AI Assistant  
**Purpose:** Verify that all weight methods export complete data to Excel

---

## TESTING INSTRUCTIONS

### Test Data Setup
1. Create a standard test file: **`test-data.xlsx`**
   - 8 Alternatives (Alt-1 to Alt-8)
   - 5 Criteria (3 Beneficial, 2 Non-Beneficial)
   - Simple numeric values for consistency

### Testing Procedure (For Each Method)
1. ✅ Import the test-data.xlsx file
2. ✅ Navigate to "Weight Methods" tab
3. ✅ Select the weight method
4. ✅ Calculate weights
5. ✅ **Count tables shown in Web UI** (note the count)
6. ✅ Click "Export" button
7. ✅ Open the downloaded Excel file
8. ✅ **Verify all tables from Web UI are in Excel**
9. ✅ **Check table numbering is sequential** (no gaps)
10. ✅ **Verify no "undefined" or blank cells** in data
11. ✅ Document findings in checklist below

---

## WEIGHT METHODS CHECKLIST

### 🟢 PRIORITY 1: OBJECTIVE METHODS (Complex)

#### ✅ 1. MEREC (Method based on Removal Effects of Criteria)
- **Status:** ✅ FIXED 2026-01-27
- **Test Date:** 2026-01-27
- **Expected Tables:**
  - Table 1: Decision Matrix
  - Table 2: Normalized Decision Matrix
  - Table 3: Final Weights
  - Table 4: Performance Scores (S_i)
  - Table 5: Removal Scores (S_i^(-k) matrix)
  - Table 6: Removal Effect of each criterion (E_k)

- **Return Fields in Code:**
  ```
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  performanceScores: Record<string, number>
  removalScores: Record<string, Record<string, number>>
  removalEffects: Record<string, number>
  ```

- **Web UI Tables Found:** 6
- **Excel Tables Found:** 6 (after fix)
- **Issues:** ❌ Was missing "Removal Effects" table
- **Fix Applied:** Added 'effect' keyword to filter, added to preferredOrder

---

#### ⬜ 2. Entropy Method
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________
- **Expected Tables:**
  - Table 1: Decision Matrix
  - Table 2: Normalized Decision Matrix
  - Table 3: Entropy for Attributes (entropy matrix)
  - Table 4: Entropy Values (Ej) - single row
  - Table 5: Diversity Degree (dj) - single row
  - Table 6: Final Weights

- **Return Fields in Code:**
  ```
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  entropyValues: Record<string, number>
  diversityValues: Record<string, number>
  entropyMatrix: Record<string, Record<string, number>>
  ```

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________
- **Notes:** Special handling exists for entropyValues (added to entropyMatrix table)

---

#### ⬜ 3. CRITIC (Criteria Importance Through Intercriteria Correlation)
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________
- **Expected Tables:**
  - Table 1: Decision Matrix
  - Table 2: Normalization (r_ij)
  - Table 3: Standard Deviation (σ_j)
  - Table 4: Correlation Matrix (r_jk)
  - Table 5: Information Measure (Cj)
  - Table 6: Final Weights

- **Return Fields in Code:**
  ```
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  standardDeviations: Record<string, number>
  correlationMatrix: Record<string, Record<string, number>>
  informationAmounts: Record<string, number>
  ```

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________

---

#### ⬜ 4. DEMATEL (Decision Making Trial and Evaluation Laboratory)
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________
- **Expected Tables:**
  - Table 1: Decision Matrix
  - Table 2: Direct Influence Matrix
  - Table 3: Normalized Direct Influence Matrix
  - Table 4: Total Influence Matrix
  - Table 5: Influence Sent/Received
  - Table 6: Final Weights

- **Return Fields in Code:**
  ```
  weights: Record<string, number>
  directInfluenceMatrix: Record<string, Record<string, number>>
  normalizedMatrix: Record<string, Record<string, number>>
  totalInfluenceMatrix: Record<string, Record<string, number>>
  sentInfluence: Record<string, number>
  receivedInfluence: Record<string, number>
  prominence: Record<string, number>
  relation: Record<string, number>
  ```

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________
- **Notes:** Complex method with many matrices

---

#### ⬜ 5. SD (Standard Deviation)
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________
- **Expected Tables:**
  - Table 1: Decision Matrix
  - Table 2: Normalized Matrix
  - Table 3: Standard Deviations
  - Table 4: Final Weights

- **Return Fields in Code:**
  ```
  weights: Record<string, number>
  normalizedMatrix?: Record<string, Record<string, number>>
  standardDeviations: Record<string, number>
  ```

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________

---

#### ⬜ 6. Variance Method
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________
- **Expected Tables:**
  - Table 1: Decision Matrix
  - Table 2: Normalized Matrix
  - Table 3: Variance Values
  - Table 4: Final Weights

- **Return Fields in Code:**
  ```
  weights: Record<string, number>
  normalizedMatrix?: Record<string, Record<string, number>>
  variances: Record<string, number>
  ```

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________

---

#### ⬜ 7. MAD (Mean Absolute Deviation)
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________
- **Expected Tables:**
  - Table 1: Decision Matrix
  - Table 2: Normalized Matrix
  - Table 3: Mean Values
  - Table 4: MAD Values
  - Table 5: Final Weights

- **Return Fields in Code:**
  ```
  weights: Record<string, number>
  normalizedMatrix?: Record<string, Record<string, number>>
  means: Record<string, number>
  madValues: Record<string, number>
  ```

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________

---

### 🟡 PRIORITY 2: ADVANCED OBJECTIVE METHODS

#### ⬜ 8. WENSLO
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________
- **Expected Tables:**
  - Table 1: Decision Matrix
  - Table 2: Normalized Matrix
  - Table 3: Weighted Sum
  - Table 4: Final Weights

- **Return Fields in Code:**
  ```
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  weightedSum: Record<string, number>
  ```

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________

---

#### ⬜ 9. LOPCOW (Logarithmic Percentage Change-driven Objective Weighting)
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________
- **Expected Tables:**
  - Table 1: Decision Matrix
  - Table 2: Normalized Matrix
  - Table 3: Logarithmic Matrix
  - Table 4: Percentage Changes
  - Table 5: Final Weights

- **Return Fields in Code:**
  ```
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  logarithmicMatrix: Record<string, Record<string, number>>
  percentageChanges: Record<string, number>
  ```

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________

---

#### ⬜ 10. DBW (Distance-Based Weighting)
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________

- **Return Fields in Code:** Unknown - needs code inspection

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________

---

#### ⬜ 11. SVP (Statistical Variance Procedure)
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________

- **Return Fields in Code:** Unknown - needs code inspection

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________

---

#### ⬜ 12. MDM (Mean Difference Method)
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________

- **Return Fields in Code:** Unknown - needs code inspection

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________

---

#### ⬜ 13. LSW (Least Squares Weighting)
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________

- **Return Fields in Code:** Unknown - needs code inspection

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________

---

#### ⬜ 14. GPOW (Gini-based Partial Objective Weighting)
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________

- **Return Fields in Code:** Unknown - needs code inspection

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________

---

#### ⬜ 15. LPWM (Linear Programming Weighting Method)
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________

- **Return Fields in Code:** Unknown - needs code inspection

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________

---

#### ⬜ 16. PCWM (Principal Component Weighting Method)
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________
- **Expected Tables:**
  - Table 1: Decision Matrix
  - Table 2: Normalized Matrix
  - Table 3: Covariance Matrix (?)
  - Table 4: Eigen Values/Vectors (?)
  - Table 5: Final Weights

- **Return Fields in Code:**
  ```
  weights: Record<string, number>
  // Additional fields unknown
  ```

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________

---

### 🔵 PRIORITY 3: SUBJECTIVE METHODS

#### ⬜ 17. AHP (Analytic Hierarchy Process)
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________
- **Expected Tables:**
  - Table 1: Decision Matrix
  - Table 2: AHP Pairwise Comparison Matrix
  - Table 3: Consistency Ratio (CR): 0.XXXX
  - Table 4: Final Weights

- **Return Fields in Code:**
  ```
  weights: Record<string, number>
  pairwiseMatrix: number[][]
  consistencyRatio: number
  ```

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________
- **Notes:** Consistency Ratio is a scalar, special handling exists

---

#### ⬜ 18. PIPRECIA
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________
- **Expected Tables:**
  - Table 1: Decision Matrix
  - Table 2: Importance Scores
  - Table 3: Coefficients
  - Table 4: Final Weights

- **Return Fields in Code:**
  ```
  weights: Record<string, number>
  scores: Record<number, number>
  coefficients: Record<string, number>
  ```

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________

---

#### ⬜ 19. SWARA (Step-wise Weight Assessment Ratio Analysis)
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________
- **Expected Tables:**
  - Table 1: Decision Matrix
  - Table 2: Comparative Importance Coefficients (s_j)
  - Table 3: Recalculated Values (k_j)
  - Table 4: Final Weights

- **Return Fields in Code:**
  ```
  weights: Record<string, number>
  coefficients: Record<string, number>
  kValues: Record<string, number>
  qValues: Record<string, number>
  ```

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________

---

#### ⬜ 20. ROC (Rank Order Centroid)
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________
- **Expected Tables:**
  - Table 1: Decision Matrix
  - Table 2: Criteria Ranks
  - Table 3: Final Weights

- **Return Fields in Code:**
  ```
  weights: Record<string, number>
  ranks: Record<string, number>
  ```

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________

---

#### ⬜ 21. RR (Rank Reciprocal)
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________
- **Expected Tables:**
  - Table 1: Decision Matrix
  - Table 2: Criteria Ranks
  - Table 3: Final Weights

- **Return Fields in Code:**
  ```
  weights: Record<string, number>
  ranks: Record<string, number>
  ```

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________

---

### 🟢 PRIORITY 4: SIMPLE METHODS

#### ⬜ 22. Equal Weights
- **Status:** ⚠️ NEEDS TESTING
- **Test Date:** _____________________
- **Expected Tables:**
  - Table 1: Decision Matrix
  - Table 2: Final Weights (all equal)

- **Return Fields in Code:**
  ```
  weights: Record<string, number>
  ```

- **Web UI Tables Found:** _____
- **Excel Tables Found:** _____
- **Issues:** _________________________________
- **Notes:** Simplest method, should work

---

## TESTING SUMMARY

| Category | Total Methods | Tested | Passed | Failed | Pending |
|----------|---------------|--------|--------|--------|---------|
| Priority 1 (Complex Objective) | 7 | 1 | 1 | 0 | 6 |
| Priority 2 (Advanced Objective) | 9 | 0 | 0 | 0 | 9 |
| Priority 3 (Subjective) | 5 | 0 | 0 | 0 | 5 |
| Priority 4 (Simple) | 1 | 0 | 0 | 0 | 1 |
| **TOTAL** | **22** | **1** | **1** | **0** | **21** |

---

## COMMON ISSUES TO WATCH FOR

### Export Route Issues
1. **Missing Keyword in Filter** (lines 172-190 in export/route.ts)
   - Check if field names like "effect", "gap", "sent", "received" etc. are in filter
   
2. **Not in Preferred Order** (lines 144-170 in export/route.ts)
   - Fields not in this list may appear out of order
   
3. **Missing Custom Naming** (lines 223-266 in export/route.ts)
   - Fields without custom names will show auto-generated ugly names

### Data Structure Issues
1. **Vector vs Matrix Confusion**
   - Single-row data might be treated as matrix
   
2. **Scalar Values Not Handled**
   - Like Consistency Ratio in AHP (needs special handling)

### Display Issues
1. **Table Numbering Gaps**
   - Indicates missing table
   
2. **Undefined or Blank Cells**
   - Data not passed correctly from calculation to export

---

## NEXT STEPS

1. **Immediate:** Test Priority 1 methods (6 remaining)
2. **This Week:** Test Priority 2 & 3 methods
3. **Before Release:** Test all 22 methods
4. **Document:** Update this checklist with findings
5. **Fix:** Address any issues found
6. **Verify:** Re-test fixed methods

---

## NOTES & OBSERVATIONS

### 2026-01-27
- Fixed MEREC export issue
- Added 'effect' keyword to filter
- Added performanceScores, removalScores, removalEffects to preferredOrder
- All 6 MEREC tables now export correctly

_____________________________________

_____________________________________

_____________________________________

---

**End of Checklist**
