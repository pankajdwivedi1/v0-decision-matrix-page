# K% Sensitivity Analysis - Auto-Recalculation Fix

## Issue Summary
When users changed the **weight method** in the K% Sensitivity Analysis, the results (tables and graphs) were **not automatically recalculating**, while changes to other parameters (ranking method, criterion to vary, quick presets) were working correctly.

## Root Cause
The issue was in the `useEffect` hooks that monitor changes to trigger automatic recalculation:

1. **Weight Method Hook (Line 169-178)**: 
   - Was using `workingCriteria` as a dependency
   - React couldn't reliably detect changes to complex objects like `workingCriteria`
   - The object reference would change, but React's shallow comparison might miss it or timing issues occurred

2. **Variation Range Hook (Line 196-205)**:
   - Was using `kSensVariationRange` (an array) directly
   - Arrays can have similar reference comparison issues in React

## Solution Implemented

### Fix 1: Weight Method Auto-Recalculation
**Before:**
```typescript
}, [selectedWeightMethod, workingCriteria]);
```

**After:**
```typescript
}, [selectedWeightMethod, JSON.stringify(workingCriteria.map(c => c.weight))]);
```

**Why this works:**
- Serializes only the weight values (not the entire object)
- Creates a primitive string that React can reliably compare
- Whenever any weight value changes, the stringified version changes, triggering the effect

### Fix 2: Variation Range Auto-Recalculation
**Before:**
```typescript
}, [kSensVariationRange]);
```

**After:**
```typescript
}, [JSON.stringify(kSensVariationRange)]);
```

**Why this works:**
- Converts the array to a string for reliable comparison
- Ensures React detects changes when Quick Presets are selected

## Testing Checklist
After this fix, the following should automatically recalculate results:

- ✅ **Weight Method** changes (Equal, Entropy, CRITIC, ROC, RR, SWARA, AHP, PIPRECIA, Custom)
- ✅ **Ranking Method** changes (TOPSIS, MOORA, VIKOR, etc.)
- ✅ **Criterion to Vary** selection changes
- ✅ **Quick Presets** selection (±10%, ±20%, ±30%, etc.)
- ✅ **Custom Variation Points** input changes

## Technical Notes
- The fix maintains the 300ms debounce for weight changes to allow async weight calculations to complete
- The fix maintains the 100ms debounce for variation range changes
- All other auto-recalculation mechanisms remain unchanged
