# All Weight Methods Export Implementation Plan
**Date:** 2026-01-27 15:07 IST  
**Goal:** Make Excel export match web UI for all 22 weight methods

---

## APPROACH

Same as DEMATEL:
1. Identify tables shown in web UI for each method
2. Create special handling in export route
3. Match order and format exactly

---

## IMPLEMENTATION STRATEGY

### Phase 1: Simple Methods (5 methods) - ~30 mins
These show only 2-3 tables (Decision Matrix + Normalized Matrix + Weights)

1. **Equal Weights** - 2 tables
2. **Variance** - 3 tables  
3. **SD (Standard Deviation)** - 3 tables
4. **ROC (Rank Order Centroid)** - 2-3 tables
5. **RR (Rank Reciprocal)** - 2-3 tables

### Phase 2: Medium Methods (8 methods) - ~2 hours
These show 3-5 tables with some special displays

6. **Entropy** - 4-5 tables
7. **CRITIC** - 4-5 tables
8. **MEREC** - 5-6 tables (already has some support)
9. **MAD** - 3-4 tables
10. **PCWM** - 4-5 tables
11. **DBW** - Need to check web UI
12. **SVP** - Need to check web UI
13. **MDM** - Need to check web UI

### Phase 3: Complex Methods (8 methods) - ~3 hours
These show 5+ tables with complex formatting

14. **DEMATEL** ✅ DONE - 7 tables
15. **AHP** - 5-6 tables (pairwise matrix, consistency checks)
16. **LOPCOW** - 4-5 tables
17. **SWARA** - 4-5 tables
18. **PIPRECIA** - 4-5 tables
19. **WENSLO** - Need to check web UI
20. **LSW** - Need to check web UI
21. **GPOW** - Need to check web UI
22. **LPWM** - Need to check web UI

---

## IMPLEMENTATION METHOD

For each weight method, I will:

1. **Analyze Web UI** - Find the display section in page.tsx
2. **Document Tables** - List all tables shown (name, order, format)
3. **Create Export Logic** - Add special handling block in export route
4. **Test & Verify** - You test one method, I move to next

---

## CODE STRUCTURE

Each method will have this block in `app/api/export/route.ts`:

```typescript
if (weightMethod?.toLowerCase() === 'methodname' && metrics) {
  // Custom table rendering matching web UI
  // Table 1: ...
  // Table 2: ...
  // etc.
} else if (weightMethod?.toLowerCase() === 'nextmethod' && metrics) {
  // Next method...
}
```

---

## DECISION POINTS

### Question 1: Should I do all 22 at once or in phases?
- **Option A:** Do all 22, then you test all at end (~5-6 hours work)
- **Option B:** Do Phase 1 (simple), you test, then Phase 2, you test, etc. (~6-7 hours total, more breaks)

### Question 2: What about methods we're unsure about (DBW, SVP,MDM, LSW, GPOW, LPWM, WENSLO)?
- **Option A:** I check web UI code, implement based on what I find
- **Option B:** You tell me which ones are actually used/important, skip the rest

---

## MY RECOMMENDATION

**Start with Phase 1 (Simple Methods)**:
1. I'll implement Equal, Variance, SD, ROC, RR (~30 mins)
2. You test these 5 methods (10 mins)
3. If all pass, I continue to Phase 2
4. If issues, we fix before moving on

This way:
- ✅ We validate the approach works for all method types
- ✅ You see quick progress
- ✅ We can course-correct if needed

**Ready to start Phase 1?**

Or do you prefer I just do all 22 in one go and you test at the very end?
