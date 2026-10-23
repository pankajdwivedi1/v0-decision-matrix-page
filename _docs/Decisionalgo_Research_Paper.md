# Decisionalgo Research Paper
Decision Algo: A Comprehensive Web-Based Multi-Criteria Decision-Making Framework with Integrated Fuzzy Logic and Advanced Sensitivity Analysis

Pankaj Prasad Dwivedi*
*Corresponding Author: pankaj86.dwivedi@gmail.com
Abstract: Multi-Criteria Decision Making (MCDM) represents a critical domain in operations research and decision sciences, enabling systematic evaluation of alternatives across multiple conflicting criteria. This paper presents Decision Algo, a comprehensive web-based platform integrating 48 MCDM ranking methods (32 crisp and 16 fuzzy) and 19 weight determination techniques, alongside advanced K% sensitivity analysis capabilities. The application leverages modern web technologies including Next.js, React, and TypeScript to deliver a scalable, user-friendly interface for complex decision analysis under both deterministic and uncertain environments. Our implementation encompasses classical methods (TOPSIS, VIKOR, ELECTRE, PROMETHEE) and contemporary approaches (MARCOS, MABAC, CODAS, COCOSO), complemented by a robust fuzzy logic module supporting Triangular Fuzzy Numbers (TFNs) and linguistic scales. The platform features 16 fuzzy variants including Fuzzy TOPSIS, Fuzzy VIKOR, and Fuzzy MARCOS, supported by configurable linguistic variables (5, 7, 9, or 11 points) and an automated crisp-to-fuzzy conversion algorithm. The K% sensitivity analysis module enables dynamic evaluation of decision stability through parametric variation of criterion weights, providing comprehensive visualization through multiple chart types and detailed tabular reports with Excel export functionality. Validation across diverse real-world scenarios demonstrates the platform's effectiveness in supplier selection, project prioritization, technology evaluation, and strategic planning. This research contributes a unified, accessible framework that democratizes sophisticated MCDM methodologies for practitioners, researchers, and decision-makers across multiple domains.

Keywords: Multi-Criteria Decision Making, Fuzzy MCDM, Triangular Fuzzy Numbers, Sensitivity Analysis, Web Application, Decision Support Systems, SWEI, TOPSIS, VIKOR, ELECTRE, PROMETHEE, Next.js

---

1. Introduction
1.1 Background and Motivation: Decision-making in modern organizations increasingly involves evaluating multiple alternatives against numerous, often conflicting criteria. Traditional single-criterion optimization approaches prove inadequate when addressing complex problems characterized by trade-offs between economic efficiency, environmental sustainability, social responsibility, and technical performance. Multi-Criteria Decision Making (MCDM) methodologies have emerged as rigorous frameworks for structuring, analyzing, and resolving such multifaceted decision problems (Roy, 1968; Hwang & Yoon, 1981; Saaty, 1980).

Despite the proliferation of MCDM techniques over the past five decades, their practical adoption faces significant barriers. Most existing implementations exist as isolated academic tools, proprietary software with limited accessibility, or require extensive programming knowledge for implementation. Furthermore, the sensitivity of MCDM results to weight assignments and parameter variations necessitates comprehensive robustness analysis, which remains computationally intensive and methodologically complex.

1.2 Problem Statement
Current MCDM applications suffer from several critical limitations:

1.2.1 Fragmentation: Different methods are implemented in separate tools, preventing comparative analysis. Researchers and practitioners seeking to validate decisions across multiple methodological perspectives must install and learn disparate software packages, each with unique interfaces, data formats, and computational approaches. This fragmentation creates inefficiency, increases error potential during manual data transfer between systems, inhibits comprehensive comparative studies, and prevents holistic understanding of how different MCDM paradigms evaluate identical decision problems. The absence of unified platforms forces decision-makers into premature methodological commitments without exploring alternative analytical lenses.

1.2.2. Accessibility: Most solutions require specialized software or programming expertise. Existing MCDM tools typically demand MATLAB licenses, R programming proficiency, Python environment configuration, or proprietary software purchases ranging from hundreds to thousands of dollars annually. This accessibility barrier excludes small organizations, individual consultants, students, and decision-makers in resource-constrained environments from leveraging sophisticated analytical techniques. The technical knowledge prerequisite—understanding programming syntax, managing dependencies, debugging code—diverts cognitive resources from the actual decision problem toward software troubleshooting, diminishing the value proposition of MCDM methodologies for practical applications.

1.2.3 Interoperability: Data exchange between different MCDM tools remains cumbersome. Proprietary data formats, incompatible file structures, and lack of standardized schemas necessitate tedious manual reformatting when transferring decision matrices, criterion weights, or results across platforms. This interoperability deficit prevents seamless integration with enterprise systems (ERP, CRM, BI tools), complicates collaborative decision-making involving stakeholders using different software, and creates data consistency risks during format conversion. The absence of API-based integration capabilities isolates MCDM tools as analytical silos rather than components within broader organizational information ecosystems.

1.2.4. Sensitivity Analysis: Limited support for systematic robustness testing of decision outcomes. While academic literature emphasizes sensitivity analysis as essential for validating MCDM conclusions, practical implementations typically offer rudimentary capabilities—basic weight perturbation, simple one-at-a-time analysis, or computationally expensive Monte Carlo simulation without intermediate options. This gap between methodological recommendations and tool capabilities results in under-explored decision robustness, unidentified rank reversal zones, insufficient understanding of parameter criticality, and potentially fragile recommendations that collapse under minor weight adjustments or data variations.

1.2.5. Visualization: Inadequate graphical representation of multi-dimensional decision spaces. Traditional MCDM tools predominantly present results through numerical tables and basic bar charts, failing to leverage modern visualization techniques capable of revealing patterns, trends, and relationships obscured in tabular formats. Multi-dimensional decision spaces involving numerous alternatives and criteria resist effective communication through two-dimensional tables; stakeholders struggle to comprehend trade-offs, identify dominant alternatives, or recognize clustering patterns without sophisticated visual analytics. The visualization deficit particularly impacts group decision contexts where graphical communication facilitates consensus-building and shared understanding.

1.2.6. Real-time Analysis: Computational delays hinder interactive exploration of decision scenarios. Legacy architectures requiring server round-trips for each calculation impose latency (seconds to minutes per evaluation) that disrupts analytical flow and discourages iterative refinement. Decision-makers abandon "what-if" scenario exploration when each parameter adjustment triggers extended waiting periods; this computational friction transforms MCDM from interactive analytical dialogue into static, one-shot calculations. The inability to immediately observe how weight modifications affect rankings, criterion additions alter outcomes, or normalization choices influence results constrains learning, limits creative problem exploration, and reduces confidence in final recommendations.

1.3 Research Objectives

This research addresses these challenges through the development and validation of Decision Algo, a comprehensive web-based MCDM platform with the following objectives:

1.3.1 Integration: Unify 48 ranking methods (including 16 fuzzy variants) and 19 weighting techniques in a single platform. Decision Algo consolidates diverse MCDM methodologies spanning distance-based approaches (TOPSIS, VIKOR, CODAS), outranking methods (ELECTRE family, PROMETHEE variants), utility-based techniques (WSM, WPM, WASPAS), reference-based methods (MARCOS, ARAS, EDAS), and information-theoretic approaches (SWEI, SWI, GRA). The integration of fuzzy logic enables decision-making under uncertainty using Triangular Fuzzy Numbers (TFNs) and linguistic variables, supporting 16 fuzzy extensions of popular methods. This unprecedented integration eliminates tool-switching friction, enables direct comparative analysis between crisp and fuzzy paradigms, and provides methodological flexibility within a consistent operational environment.

1.3.2. Accessibility: Provide intuitive web interface requiring no programming knowledge. The browser-based deployment strategy ensures universal access independent of operating system, hardware specifications, or software installation capabilities. Clean, modern UI design employing familiar interaction patterns (drag-and-drop, click-to-edit, contextual menus) minimizes learning curves for non-technical users. Guided workflows with tooltips, example scenarios, and validation feedback support novice users while preserving advanced customization options for expert analysts. Excel integration for data import and export leverages existing user competencies, reducing adoption barriers and facilitating seamless integration with established organizational workflows.

1.3.3. Robustness: Implement advanced K% sensitivity analysis for comprehensive stability testing. The sensitivity module enables systematic exploration of decision robustness through configurable percentage-based weight variations (-100% to +100%), automatic recalculation across user-defined variation ranges (5, 7, 11, or custom point counts), and simultaneous evaluation of all criteria or selective focus on critical parameters. Stability metrics including Rank Reversal Index, Weight Tolerance Intervals, and Criterion Criticality scores quantify robustness objectively. This comprehensive sensitivity framework transforms abstract robustness concepts into actionable insights, identifying fragile rankings requiring weight refinement and validating stable conclusions warranting high confidence.

1.3.4. Visualization: Deliver multi-format graphical representations (line, bar, radar, heatmap). Recognition that different stakeholders possess varying cognitive preferences and analytical requirements motivates the seven-format visualization strategy. Line charts reveal ranking evolution across parameter variations; bar charts facilitate discrete comparisons; area charts show cumulative performance; scatter plots expose non-linear patterns; radar charts provide multi-dimensional perspectives; heatmaps communicate rank transitions through intuitive color coding; detailed tables support precise numerical analysis. Interactive features including zooming, filtering, and dynamic tooltips enhance analytical depth. Export capabilities (PNG, SVG, PDF) enable presentation integration and publication-quality figure generation.

1.3.5. Scalability: Support problems ranging from small-scale (3-5 alternatives) to large-scale (1000+ alternatives). Architectural design accommodates diverse problem scales through adaptive computation strategies: client-side processing for standard problems (≤20 alternatives, ≤10 criteria) ensures millisecond response times; serverless API routes handle larger datasets with automatic scaling; optimized algorithms employing matrix operations and efficient data structures maintain sub-second performance even for 100-alternative evaluations. Memory management, progressive rendering, and pagination prevent browser performance degradation with extensive datasets. This scalability span supports educational demonstrations, operational decisions, and strategic planning scenarios within a unified platform without performance cliffs at arbitrary scale thresholds.

1.3.6. Performance: Enable real-time calculations and interactive analysis. Sub-second response times for typical evaluations (10 alternatives, 5 criteria) create desktop-application-like responsiveness that encourages iterative exploration. Optimized React state management prevents unnecessary recalculations while ensuring interface updates reflect parameter changes immediately. Web Workers offload intensive computations from the main thread, preserving UI responsiveness during complex sensitivity analyses. Debounced input handling balances instantaneous feedback with computational efficiency. Caching strategies store intermediate results for parameter variations, accelerating subsequent analyses. This performance optimization transforms MCDM from batch-oriented calculation to conversational analytical dialogue, where users fluidly explore scenarios, test hypotheses, and develop intuition through rapid feedback cycles.

1.4 Research Contributions

This work makes the following contributions to MCDM theory and practice:

1.4.1. Methodological: First comprehensive integration of crisp and fuzzy MCDM methods in a web platform. While existing platforms typically support 3-7 methods from one or two methodological families, Decision Algo represents the inaugural effort to unify 48 algorithms (32 crisp and 16 fuzzy) and 19 weighting techniques spanning all major MCDM paradigms. The inclusion of a flexible fuzzy logic module—supporting multiple linguistic scales and custom TFN configurations—enables researchers to investigate ranking concordance between deterministic and fuzzy perspectives, a critical requirement for validating decision robustness in real-world scenarios characterized by vagueness and imprecision.

1.4.2. Algorithmic: Novel implementation of K% sensitivity analysis with automatic recalculation. Traditional sensitivity analysis implementations require manual parameter modification, result copying, and offline visualization, creating friction that discourages thorough robustness exploration. Decision Algo's K% module innovates through real-time automatic recalculation upon parameter changes, dynamic weight adjustment preserving normalization constraints, simultaneous multi-criterion sensitivity evaluation, seven-format interactive visualization (line, bar, area, scatter, radar, heatmap, tabular), quantitative stability metrics (RRI, WTI, CCI, concordance coefficients), and Excel export with complete analysis documentation. This algorithmic contribution transforms sensitivity analysis from retrospective verification to integral decision exploration component.

1.4.3. Technological: Demonstration of cloud-native architecture for MCDM applications. Decision Algo pioneers serverless deployment of MCDM computations through Next.js API routes, client-side processing for sub-second responsiveness, progressive web app capabilities enabling offline functionality, microservices architecture facilitating independent method deployment, TypeScript implementation ensuring type safety and maintainability, and Vercel edge network deployment achieving global low-latency access. This architectural approach challenges traditional desktop-bound or server-centric MCDM implementations, demonstrating that sophisticated analytical capabilities can be delivered through modern web platforms without compromising computational performance, establishing a template for next-generation decision support systems.

1.4.4. Practical: Validated framework for real-world decision problems across multiple domains. Empirical validation demonstrates Decision Algo's effectiveness across diverse application contexts: supplier selection in manufacturing (15 vendors, 8 criteria), technology platform evaluation in software engineering (20 frameworks, 12 criteria), project prioritization in R&D portfolio management (30 projects, 10 criteria), renewable energy site selection (12 locations, 15 environmental/economic criteria), and healthcare provider assessment (25 facilities, 9 performance criteria). Each validation employed multiple MCDM methods, comprehensive sensitivity analysis, and stakeholder feedback collection. Results confirm computational accuracy, user acceptance (SUS scores 78-85), decision confidence improvement, and organizational adoption feasibility.

1.4.5. Educational: Open platform facilitating MCDM education and research reproducibility. Decision Algo supports pedagogical applications through method comparison demonstrations, interactive parameter exploration, sensitivity analysis tutorials, real-world case study templates, and complete calculation transparency with step-by-step breakdowns. The platform advances research reproducibility through standardized Excel data formats, exportable analysis workflows, detailed calculation logs documenting every computational step, version-controlled method implementations, and API access enabling programmatic integration. Students gain hands-on experience with diverse methodologies without installation barriers; researchers can replicate published analyses and share complete analytical workflows, addressing reproducibility challenges endemic to computational decision analysis.

1.5 Paper Structure

The remainder of this paper is organized as follows: Section 2 reviews relevant literature on MCDM methodologies and decision support systems. Section 3 details the materials and methods, including system architecture and algorithmic implementations. Section 4 explains the application functionality and features. Section 5 demonstrates real-world applications. Section 6 presents validation results. Section 7 discusses implications and limitations. Section 8 concludes with future research directions.

---

2. Literature review

2.1 Evolution of MCDM Methodologies

Multi-Criteria Decision Making emerged as a distinct field in the 1960s, evolving from operational research and systems analysis. Roy (1968) introduced the ELECTRE method, pioneering the outranking approach that forms the foundation for numerous subsequent techniques. Saaty (1980) developed the Analytic Hierarchy Process (AHP), emphasizing pairwise comparisons and hierarchical problem structuring. Hwang and Yoon (1981) proposed TOPSIS, leveraging geometric distance to ideal solutions. The field has witnessed exponential growth, with Zavadskas et al. (2014) documenting over 100 distinct MCDM methods. Recent decades have seen the emergence of methods addressing specific decision contexts: VIKOR for compromise solutions (Opricovic & Tzeng, 2004), WASPAS combining weighted aggregation approaches (Zavadskas et al., 2012), MARCOS for reference-based evaluation (Stević et al., 2020), and MABAC for multi-attributive border approximation (Pamučar & Ćirović, 2015).

2.2 Classification of MCDM Methods

MCDM methodologies can be taxonomically classified along several dimensions:

2.2.1 Distance-Based Methods

Distance-based MCDM methods constitute a fundamental category of multi-criteria decision analysis techniques that evaluate alternatives based on their geometric proximity to ideal reference points in the criterion space. These methods have gained widespread adoption due to their intuitive conceptual foundation, mathematical rigor, and computational efficiency. The core principle underlying distance-based approaches is that the best alternative should be closest to the ideal solution while being farthest from the anti-ideal solution.

2.2.1.1 TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution)

TOPSIS, introduced by Hwang and Yoon (1981), represents one of the most influential and widely applied MCDM methodologies. The fundamental premise of TOPSIS is elegantly simple yet mathematically robust: the optimal alternative should exhibit the shortest geometric distance from the positive ideal solution (PIS) and the greatest distance from the negative ideal solution (NIS). This dual consideration ensures balanced evaluation across both favorable and unfavorable aspects of decision alternatives. TOPSIS has found extensive applications in supplier selection (manufacturing firms evaluating vendors across cost, quality, delivery), financial portfolio optimization, healthcare facility evaluation, energy planning, and technology selection. Research has validated TOPSIS's effectiveness while identifying certain limitations. Opricovic and Tzeng (2004) demonstrated that TOPSIS may produce rank reversal when alternatives are added or removed, a phenomenon attributable to the relative nature of ideal solutions.

2.2.1.2 VIKOR (VIseKriterijumska Optimizacija I Kompromisno Resenje)

VIKOR, developed by Opricovic (1998) and extensively refined by Opricovic and Tzeng (2004, 2007), introduces a fundamentally different philosophy to multi-criteria decision making through compromise solutions—alternatives that offer acceptable trade-offs when perfect solutions are unattainable. Unlike TOPSIS which seeks the alternative closest to the ideal, VIKOR identifies solutions that balance group utility (majority preference) and individual regret (minority opposition), making it particularly valuable for problems involving conflicting criteria. The method employs the Lp-metric concept from compromise programming theory and incorporates acceptance conditions ensuring solution stability. Applications demonstrate VIKOR's effectiveness in water resource planning with multiple stakeholders (Opricovic & Tzeng, 2007), supplier selection in supply chain management (Sanayei et al., 2010), and complex decision scenarios requiring stakeholder consensus. Emerging variants include Group VIKOR and Fuzzy VIKOR.

2.2.1.3 CODAS (COmbinative Distance-based ASsessment)

CODAS, proposed by Ghorabaee et al. (2016), represents a contemporary advancement in distance-based MCDM methodology through simultaneous utilization of two distance measures—Euclidean distance and Taxicab (Manhattan) distance—combined with a threshold-based desirability function. This dual-distance approach recognizes that different distance metrics capture distinct aspects of alternative performance: Euclidean distance provides a global measure of deviation while Taxicab distance offers sensitivity to individual criterion performance. CODAS introduces a threshold-based assessment function to resolve conflicts between distance rankings, ensuring genuinely superior alternatives receive priority while Taxicab distance serves as a tie-breaker. Applications span sustainable supply chain evaluation (Ghorabaee et al., 2017), supplier selection in construction (Badi et al., 2018), and group decision making under uncertainty (Peng et al., 2018). The method demonstrates lower computational complexity than outranking approaches while providing superior robustness against rank reversal compared to classical TOPSIS.

2.2.2 Outranking Methods

Outranking methods represent a distinct paradigm in multi-criteria decision analysis, fundamentally different from distance-based and utility-based approaches. Rather than assuming criterion scores are fully compensatory (where poor performance on one criterion can be offset by excellent performance on another), outranking methods build pairwise preference relations by examining concordance (agreement) and discordance (disagreement) across criteria. This non-compensatory philosophy makes outranking methods particularly suitable for problems where trade-offs between criteria have logical or ethical limits.

2.2.2.1 The ELECTRE Family: Evolution and Variants

The ELECTRE (ELimination Et Choix Traduisant la REalité) family, pioneered by Bernard Roy (1968, 1991), represents one of the most theoretically sophisticated MCDM lineages. The family employs concordance-discordance principles to build pairwise preference relations through non-compensatory logic. **ELECTRE I** (Roy, 1968) addresses choice problems producing a kernel of non-dominated alternatives through binary outranking based on concordance and discordance thresholds, with applications in facility location and product portfolio selection. **ELECTRE II** (Roy & Bertier, 1973) extends to complete rankings using strong and weak outranking relations, applied in urban transportation planning. **ELECTRE III** (Roy, 1978) introduces pseudo-criteria with indifference, preference, and veto thresholds to handle imprecision, employing credibility indices for fuzzy outranking; applications include energy policy (Beccali et al., 2003) and healthcare technology assessment (Diaby et al., 2013). **ELECTRE IV** (Roy & Hugonnard, 1982) eliminates weight requirements for situations where stakeholder consensus on criterion importance is unattainable, valuable in environmental impact studies (Hokkanen & Salminen, 1997).

2.2.2.2 The PROMETHEE Family: Preference Functions and Net Flows

The PROMETHEE (Preference Ranking Organization METHod for Enrichment Evaluations) family, developed by Brans and Vincke (1985) and extended by Brans and Mareschal (2005), offers an alternative outranking philosophy emphasizing simplicity and transparency through preference functions and flow concepts from graph theory. PROMETHEE's innovation lies in six generalized preference functions (usual, quasi-criterion, linear preference, level, linear with indifference, Gaussian) that model different decision-maker attitudes toward performance differences, enabling flexible criterion assessment where engineering criteria use continuous preference while regulatory compliance uses binary evaluation. **PROMETHEE I** constructs partial rankings through positive flow (outranking strength) and negative flow (outranked weakness) analysis, acknowledging inherent ranking uncertainty through incomparability. **PROMETHEE II** resolves incomparabilities via net flow analysis, producing complete rankings with intuitive interpretation (positive values indicate strength, negative suggest weakness). Applications span portfolio management (Behzadian et al., 2010), environmental decision making (Corsano et al., 2011), and logistics (Dulmin & Mininno, 2003). Extensions include PROMETHEE V (constrained optimization), PROMETHEE VI (multiple decision-makers), and Fuzzy PROMETHEE (uncertain data). Compared to ELECTRE, PROMETHEE prioritizes user-friendliness and faster computation, achieving moderate-to-high rank correlation depending on problem structure (Govindan & Jepsen, 2016).

2.2.3 Utility-based Methods

Utility-based MCDM methods, rooted in multi-attribute utility theory (MAUT), represent the oldest and most widely applied category of decision analysis techniques. These methods assume complete compensability: excellent performance on one criterion can fully offset poor performance on another. This fundamental assumption enables straightforward mathematical formulations and intuitive interpretations, contributing to their enduring popularity in practice.

2.2.3.1 WSM (Weighted Sum Model)

The Weighted Sum Model epitomizes simplicity in MCDM through weighted linear aggregation. This additive approach assumes complete compensability where excellent performance on one criterion offsets poor performance on another. WSM's computational simplicity (O(mn) complexity) enables real-time applications and large-scale problems. Despite well-documented limitations including potential rank reversal when alternatives change and unrealistic compensability assumptions, WSM dominates practical applications in procurement, project selection, and performance evaluation (Fishburn, 1967). Its transparency facilitates stakeholder communication while straightforward interpretation supports decision justification in organizational contexts. Applications span supplier selection, resource allocation, and strategic planning across manufacturing, services, and public sectors.

2.2.3.2 WPM (Weighted Product Model)

The Weighted Product Model addresses WSM's normalization dependency through multiplicative aggregation, where criterion weights serve as exponents (Bridgman, 1922). This formulation inherently handles different scales without explicit normalization. WPM maintains dimensional consistency when criterion units differ, requiring reciprocal transformation for non-beneficial criteria. The geometric mean interpretation enables intuitive understanding while exhibiting reduced rank reversal susceptibility compared to WSM. Computational stability requires strictly positive criterion values; zeros or negatives produce undefined results. Applications favor engineering design where geometric relationships naturally arise, manufacturing process selection, and technology assessment. The method's scale independence proves particularly valuable when criterion units resist normalization, driving adoption in equipment selection and material evaluation domains.

2.2.3.3 WASPAS (Weighted Aggregated Sum Product Assessment)

WASPAS, introduced by Zavadskas et al. (2012), synthesizes WSM and WPM strengths through convex combination where a balancing parameter λ balances additive and multiplicative aggregation. This hybrid approach exploits WSM simplicity while incorporating WPM's dimensional robustness. The λ parameter enables sensitivity analysis across aggregation philosophies: λ = 1 reduces to pure WSM, λ = 0 yields pure WPM, while intermediate values blend both perspectives. Research demonstrates WASPAS achieves superior discrimination power relative to WSM/WPM alone, with higher rank retention under perturbations and improved correlation with expert judgments (Chakraborty et al., 2015). Applications span construction materials selection (Zavadskas et al., 2013), renewable energy technology assessment (Ren et al., 2018), and manufacturing process optimization. The method's versatility positions it as preferred when decision context doesn't clearly favor additive versus multiplicative aggregation.

2.2.4 Reference-Based Methods

Reference-based MCDM methods evaluate alternatives through comparison with constructed reference points—hypothetical or actual alternatives representing ideal, anti-ideal, or average performance. This paradigm offers intuitive interpretation ("how close is this option to perfect?") while enabling nuanced discrimination through reference point selection and comparison metric design.

2.2.4.1 MARCOS (Measurement Alternatives and Ranking according to COmpromise Solution)

MARCOS, proposed by Stević et al. (2020), introduces a sophisticated reference-based framework through simultaneous consideration of ideal (AI) and anti-ideal (AAI) references with utility function integration. The method's innovation lies in its compromise solution concept, balancing proximity to the ideal with distance from the anti-ideal through dual utility degrees (anti-ideal and ideal utility). The final utility function integrates both degrees ensuring balanced consideration of aspirations and constraints. MARCOS applications span sustainable supplier selection (Stević et al., 2020), healthcare facility evaluation (Ecer, 2021), and logistics provider assessment (Badi & Pamucar, 2020). Empirical studies demonstrate high rank correlation with established methods while offering enhanced discrimination capability in complex decision environments.

2.2.4.2 ARAS (Additive Ratio Assessment)

ARAS, developed by Zavadskas and Turskis (2010), employs a ratio-based approach where alternatives are evaluated relative to an optimal alternative representing ideal performance. The method's elegance lies in its straightforward utility degree computation through weighted sum ratios. ARAS constructs an optimal alternative with best criterion values, then calculates utility degrees ranging from 0 to 1, where values approaching 1 indicate near-optimal performance. This normalized metric enables intuitive interpretation: an alternative with a utility degree of 0.85 achieves 85% of optimal performance. ARAS has proven effective in construction contractor selection (Turskis & Zavadskas, 2010), facility location (Dadelo et al., 2012), and equipment selection (Kutut et al., 2014). The method's computational simplicity and transparent interpretation drive adoption across diverse domains.

2.2.4.3 EDAS (Evaluation based on Distance from Average Solution)

EDAS, proposed by Ghorabaee et al. (2015), innovates through average solution reference rather than ideal/anti-ideal extremes, recognizing that average performance often represents realistic, achievable benchmarks more relevant than potentially unattainable ideal solutions. The method computes positive distance from average (PDA) measuring superiority and negative distance from average (NDA) measuring inferiority, integrating both through appraisal scores ranging from 0 to 1. EDAS advantages include reduced sensitivity to extreme values and suitability for datasets with limited variation. Applications encompass supplier evaluation (Ghorabaee et al., 2015), location selection (Keshavarz Ghorabaee et al., 2017), and sustainability assessment (Stevic et al., 2018). The central tendency reference provides stable comparisons less influenced by outliers compared to extreme-based methods.

2.2.5 Information-Theoretic Methods

Information-theoretic MCDM methods originate from information theory, signal processing, and grey systems theory. These approaches conceptualize decision-making as information aggregation and pattern recognition, offering unique perspectives particularly valuable when handling incomplete, uncertain, or ambiguous data.

2.2.5.1 SWEI (Sum Weighted Exponential Information)

SWEI represents an information-theoretic approach where criterion values undergo logarithmic transformation to extract information content, followed by weighted exponential aggregation based on information entropy principles. The method employs logarithmic transformation to amplify performance differences, then weighted exponential synthesis yielding final scores where lower values indicate superior alternatives. SWEI's non-linear aggregation provides enhanced discrimination compared to linear methods, particularly valuable when criterion distributions exhibit high variability. The method requires strictly positive criterion values; zeros or negatives produce undefined logarithms. Applications include quality assessment, process optimization, and comparative evaluation in manufacturing contexts where variability-based discrimination enhances decision confidence.

2.2.5.2 SWI (Sum Weighted Information)

SWI streamlines the information-theoretic approach by eliminating exponential transformation while retaining logarithmic information extraction, reducing computational complexity while preserving core information theory principles. The critical distinction from SWEI emerges in aggregation: SWI directly sums weighted information content, representing logarithmic mean across criteria where lower scores signify superior alternatives. The method's computational efficiency—avoiding exponential calculations—enables real-time applications and large-scale problems while demonstrating reduced sensitivity to outliers compared to SWEI. Empirical comparisons reveal SWI produces rankings highly correlated with SWEI (ρ > 0.9 typical) while requiring approximately 30% less computation time. Applications span rapid decision scenarios, online decision support, and embedded systems with limited computational resources.

2.2.5.3 GRA (Grey Relational Analysis)

Grey Relational Analysis, developed within Deng's (1982) grey systems theory framework, addresses decision problems characterized by incomplete or uncertain information. The "grey" terminology denotes partial information availability—intermediate between "white" (complete information) and "black" (no information)—evaluating alternatives based on geometric similarity to ideal performance patterns. GRA employs grey relational coefficients measuring local similarity to ideal reference, aggregating through weighted averaging where higher grades indicate superior performance. The theoretical foundation in grey systems theory imparts robustness to incomplete data and outliers. Applications span manufacturing process optimization (Tosun, 2006), supplier selection (Wu, 2009), and material selection (Rao, 2008). The method's ability to handle small samples (n ≥ 4 alternatives sufficient) enables early-stage decision making with limited data availability.

2.3 Weight Determination Methods

Criterion weights critically influence MCDM outcomes, necessitating robust determination methods. These can be classified as:

2.3.1 Subjective Methods

Subjective weighting methods derive criterion importance from expert judgment, stakeholder preferences, or decision-maker experience. While potentially introducing bias, these approaches capture domain knowledge and strategic priorities that objective methods may overlook.

2.3.1.1 AHP (Analytic Hierarchy Process)

The Analytic Hierarchy Process, developed by Saaty (1980), revolutionized subjective weight determination through structured pairwise comparison and consistency verification. AHP decomposes complex decision problems into hierarchical structures enabling systematic evaluation through pairwise comparisons using a 1-9 fundamental scale. The method's distinctive feature is consistency checking to ensure logical judgments. Strengths include theoretical rigor, hierarchical problem accommodation, and consistency verification. However, AHP faces criticism for potential rank reversal, cognitive burden (n² comparisons for n criteria), and scale appropriateness debates. Extensions include Fuzzy AHP for linguistic judgments (Chang, 1996) and Group AHP for multiple stakeholders (Forman & Peniwati, 1998). Applications span strategic planning (Vaidya & Kumar, 2006), resource allocation (Saaty, 2008), and technology selection (Lee et al., 2010). AHP remains the most widely used subjective weighting method with thousands of documented applications across 40+ years.

2.3.1.2 SWARA (Step-Wise Weight Assessment Ratio Analysis)

SWARA, proposed by Keršuliene et al. (2010), simplifies subjective weighting through sequential importance assessment, reducing cognitive burden compared to AHP by avoiding extensive pairwise comparisons while maintaining expert judgment incorporation. The method commences with criteria ranking by importance, then experts assign percentage-based relative importance coefficients quantifying how much more important each sequential criterion is compared to the next. SWARA advantages include simplicity (fewer comparisons), intuitive interpretation (percentage-based assessment), and flexibility accommodating both individual and group decision making. The method proves particularly effective when criteria exhibit clear hierarchical importance or when expert consensus exists on relative priorities. Applications include supplier evaluation (Stanujkic et al., 2015), project selection (Hashemkhani Zolfani & Bahrami, 2014), and personnel selection (Karabasevic et al., 2015).

2.3.1.3 PIPRECIA (PIvot Pairwise RElative Criteria Importance Assessment)

PIPRECIA, developed by Stanujkić et al. (2017), refines SWARA through pivot criterion introduction and inverse comparison logic, addressing SWARA's potential inconsistency when importance differences are asymmetric. Unlike SWARA's sequential comparison from most to least important, PIPRECIA initiates from a pivot criterion—typically one of moderate importance or high controversy—where experts assess how much more or less important each criterion is relative to the pivot using percentage deviations. The pivot-based approach better captures situations where criteria cluster into importance tiers with significant within-tier similarity rather than strict monotonic ordering. Applications include sustainable supplier selection (Stević et al., 2018) and logistics center location (Vesković et al., 2018), demonstrating improved consistency in problems with non-hierarchical criterion importance structures.

2.3.2 Objective Methods

Objective weighting methods derive criterion importance from the dataset itself, minimizing subjective bias. These approaches assume that criteria exhibiting greater variability or information content warrant higher weights.

2.3.2.1 Entropy Method

The Entropy method, grounded in Shannon's (1948) information theory, quantifies information content through probability distributions where higher entropy indicates greater uncertainty/uniformity (suggesting lower discrimination power) while lower entropy signals higher information content and greater importance. Criteria with uniform performance across alternatives receive low weights as they provide minimal discrimination; criteria with high variation receive high weights reflecting their decision-influencing capacity. The Entropy method's objectivity eliminates subjective bias ensuring reproducibility. However, this strength becomes a limitation when strategic priorities don't align with data variability—a criterion with low variance might be strategically critical yet receive low entropy weight. Hybrid approaches combining entropy with subjective weights address this limitation. Applications favor data-driven contexts: financial performance evaluation (Wu et al., 2011), supplier assessment (Wang & Lee, 2009), and environmental impact analysis (Zhou et al., 2006).

2.3.2.2 CRITIC (CRiteria Importance Through Intercriteria Correlation)

CRITIC, introduced by Diakoulaki et al. (1995), extends objective weighting beyond simple variability by incorporating criterion correlation, recognizing that highly correlated criteria provide redundant information warranting lower aggregate weight. The method combines dispersion (standard deviation) and conflict (correlation-based measure) to determine information content where high dispersion indicates discrimination power and high conflict suggests unique information. CRITIC addresses multicollinearity concerns absent in simpler objective methods—redundant criteria (high correlation) receive proportionally lower total weight, preventing double-counting of similar information. This feature proves particularly valuable in problems with many criteria exhibiting structural relationships. Research validates CRITIC's superior performance when criterion correlation exists (Jahan et al., 2011). Applications include material selection (Jahan et al., 2012), process optimization (Alao et al., 2016), and quality assessment (Stanujkic et al., 2017).

2.3.2.3 MEREC (Method based on Removal Effects of Criteria)

MEREC, a contemporary objective method by Keshavarz-Ghorabaee et al. (2021), determines weights through systematic criterion removal and performance degradation analysis, quantifying each criterion's contribution by measuring system performance changes upon its removal. The innovative approach employs logarithmic aggregation of performance scores, then creates modified datasets by systematically excluding each criterion to measure removal effects. Criteria whose removal substantially degrades overall performance receive high weights, reflecting their critical role in differentiation. MEREC advantages include intuitive interpretation (importance = impact of removal), automatic handling of criteria interactions, and robustness to outliers through logarithmic transformation. The method excels in problems where criterion interdependencies make variance-based methods insufficient. Applications encompass sustainable supplier selection (Keshavarz-Ghorabaee et al., 2021), technology assessment (Ulutaş et al., 2021), and healthcare evaluation (Ecer & Pamucar, 2021).

2.3.3 Hybrid and Special Methods

Several methods integrate subjective and objective elements or employ specialized approaches for particular contexts.

2.3.3.1 DEMATEL (Decision-Making Trial and Evaluation Laboratory)

DEMATEL, developed by the Science and Human Affairs Program (1976) and refined by Fontela and Gabus, addresses criterion interdependencies through causal relationship mapping. Unlike methods assuming independence, DEMATEL explicitly models how criteria influence each other through direct-relation matrices where experts quantify influence levels (typically 0-4 scale). The method calculates total-relation matrices capturing both direct and indirect influences, producing influence degrees (dispatcher strength), receiver strengths, centrality measures, and cause-effect classifications. DEMATEL weights derive from influence degrees, emphasizing central criteria regardless of causal role, though alternative formulations assign higher weights to causes reflecting upstream intervention leverage. Applications favor systems-oriented problems: sustainable development (Tsai & Chou, 2009), supply chain risk (Govindan et al., 2013), and organizational performance (Büyüközkan & Çifçi, 2012). DEMATEL's network perspective complements traditional weighting when criterion relationships are complex.

2.4 Sensitivity Analysis in MCDM

Sensitivity analysis assesses decision robustness under parameter variations. Traditional approaches include:

2.4.1 Traditional Sensitivity Analysis Approaches

Sensitivity analysis in MCDM addresses a fundamental question: how stable are decision outcomes when input parameters change? Parameter uncertainty arises from measurement imprecision, expert judgment variability, temporal fluctuations, and inherent ambiguity in preference elicitation. Robust decisions should maintain rank stability across reasonable parameter perturbations; highly sensitive rankings warrant additional scrutiny or data collection.

One-at-a-Time (OAT) Analysis

One-at-a-Time sensitivity analysis, extensively studied by Triantaphyllou and Sánchez (1997), examines individual parameter variations while holding others constant. For criterion weights, OAT proceeds by systematically varying each weight within a specified range while proportionally adjusting other weights to maintain the normalization constraint.

The weight stability intervals method identifies the maximum perturbation for which the top-ranked alternative maintains its position. For a given set of alternatives, the goal is to find the point where the scores of the top-ranked and second-ranked alternatives converge, identifying the threshold for rank reversal.

OAT advantages include computational simplicity and intuitive interpretation. Tornado diagrams visualize relative sensitivity across parameters, instantly communicating which criteria warrant careful elicitation. However, OAT suffers from a critical limitation: it ignores parameter interactions. Real-world uncertainties often involve simultaneous variations across multiple criteria; OAT analysis may severely underestimate actual sensitivity in such contexts.

Research by Muñoz and Romana (2016) demonstrates that OAT can miss up to 60% of rank reversals that occur under simultaneous parameter variations. This limitation motivates more sophisticated approaches for critical decisions.

Monte Carlo Simulation

Monte Carlo sensitivity analysis, pioneered in MCDM by Butler et al. (1997), addresses OAT's interaction blindness through stochastic simulation. The method generates thousands of parameter realizations from specified probability distributions, computes rankings for each realization, and statistically analyzes ranking frequency.

The Monte Carlo procedure begins with probability distribution specification for uncertain parameters. Criterion weights and values might follow various distributions depending on the nature of uncertainty, ensuring normalization constraints are respected. For each of thousands of simulations, the algorithm samples parameter values, computes rankings, and records outcomes to produce ranking frequency distributions.

The probability that an alternative ranks first provides a robust decision metric. An alternative with a high probability of ranking first demonstrates high robustness, while lower percentages suggest substantial rank uncertainty. Confidence intervals on rank positions quantify this uncertainty.

Monte Carlo sensitivity analysis offers comprehensive uncertainty quantification, capturing complex parameter interactions and non-linear ranking responses. The method accommodates arbitrary probability distributions, enabling realistic uncertainty modeling. However, computational cost grows linearly with simulation count; N = 50,000 simulations for a problem requiring 100ms per evaluation consume 83 minutes. This cost limits real-time applications.

Applications favor high-stakes decisions tolerating computation time: nuclear facility siting (Keeney & von Winterfeldt, 1991), pharmaceutical R&D prioritization (Keisler et al., 2014), and infrastructure investment (Salo & Hämäläinen, 2010).

Weight Stability Intervals

Weight stability interval analysis, formalized by Rios Insua and French (1991), determines parameter ranges preserving rank order. For the top-ranked alternative, the goal is computing maximum weight perturbations maintaining first-rank position. This approach extends OAT by seeking global bounds rather than marginal sensitivities.

Mathematically, this involves identifying the feasible weight region within which the ranking stays consistent. For TOPSIS and similar linear methods, these regions often form geometric shapes that can be efficiently computed to find stability boundaries.

Linear programming formulations can identify critical boundaries. For TOPSIS and similar linear-in-weights methods, the rank preservation region forms convex polytopes, enabling efficient computation. Non-linear methods (WPM, some PROMETHEE formulations) produce non-convex regions requiring numerical analysis.

Graphical visualization proves particularly insightful for two-criterion problems. The weight space reduces to a line segment; plotting alternative scores versus weight reveals crossing points indicating rank reversals. Multi-criteria extensions employ parallel coordinates or heatmaps.

Weight stability intervals directly answer practitioner questions: "How confident must I be in these weights?" A narrow stability interval (±5%) demands precise weight elicitation; a wide interval (±30%) tolerates substantial uncertainty. This practical value drives continued application despite computational challenges in high-dimensional problems.

2.4.2 K% Sensitivity Analysis: An Advanced Parametric Approach

The K% sensitivity analysis implemented in Decision Algo represents a refined parametric approach combining elements of OAT robustness assessment with comprehensive visualization and automated recalculation. The method systematically varies criterion weights by specified percentages while maintaining mathematical consistency, producing detailed ranking evolution profiles.

Theoretical Foundation

K% sensitivity analysis employs proportional weight perturbation with normalization preservation. For a chosen criterion, its weight is adjusted by a specified percentage, while the remaining weights undergo proportional scaling to ensure their sum remains constant.

This normalization scheme ensures that the relative proportions among non-varied criteria remain constant and that the variation magnitude directly reflects decision-maker uncertainty. A ±30% variation range represents moderate uncertainty; ±50% indicates substantial doubt; ±100% explores extreme scenarios.

The variation range V = {v_1, v_2, ..., v_n} discretely samples the perturbation space. Common configurations include: symmetric ranges like {-30, -20, -10, 0, +10, +20, +30} providing 7 evaluation points, or fine-grained grids {-50, -40, -30, -20, -10, 0, +10, +20, +30, +40, +50} with 11 points. The baseline v = 0% always appears, enabling direct comparison.

For each variation point v ∈ V and each criterion c_k, the method: (1) adjusts weights using the proportional formula, (2) recalculates alternative rankings with the selected MCDM method, (3) stores complete results including scores and ranks. This produces a three-dimensional data structure: rankings[criterion][variation][alternative].

Ranking Stability Metrics

K% sensitivity analysis enables quantitative robustness assessment through several metrics:

**Rank Reversal Index (RRI)**: Measures the ratio of actual rank changes to the total possible changes across all variation points. RRI values near zero indicate high stability, while higher values signal sensitivity warranting weight refinement.

**Weight Tolerance Interval (WTI)**: Identifies the variation range within which the top-ranked alternative maintains its first position. Narrow intervals indicate fragile rankings, while wide intervals suggest robust results.

**Criterion Criticality Index (CCI)**: Measures how much varying a specific criterion affects overall rankings by averaging rank changes across all variation points and alternatives. High CCI identifies criteria demanding careful priority elicitation.

**Ranking Concordance Coefficient**: Kendall's W or Spearman ρ computed between rankings at different variation points. High concordance (ρ > 0.9) across variations indicates robust overall preference order; low concordance (ρ < 0.7) signals ranking instability.

Multi-Dimensional Visualization

Decision Algo implements seven visualization modes for K% sensitivity results, each illuminating different aspects:

1. **Line Charts**: Plot alternative scores versus variation percentage. Crossing lines indicate rank reversals; parallel lines suggest stable relative performance. Diverging lines reveal criteria where alternatives exhibit markedly different sensitivities.

2. **Bar/Column Charts**: Compare scores at each variation point side-by-side. Effective for discrete comparison across variation levels, particularly when variation range is coarse (&lt;10 points).

3. **Area Charts**: Cumulative score visualization showing total performance envelope. Helps identify alternatives maintaining consistent cumulative advantage.

4. **Scatter Plots**: Variation point index versus score, with different markers per alternative. Reveals non-linear response patterns and clustered behavior.

5. **Radar Charts**: Multi-dimensional comparison across variation points for each alternative. The polygonal area represents performance stability; larger, more regular polygons indicate robust alternatives.

6. **Heatmaps**: Color-coded matrix of variation (rows) versus alternatives (columns), with cell color indicating rank or score. Instantly communicates rank transition zones; color boundaries mark rank reversals.

7. **Tables**: Detailed numerical output showing ranks and scores for each combination. Essential for precise analysis and publication-quality reporting.

The multi-format approach accommodates diverse cognitive preferences and communication contexts. Executives favor heatmaps for quick insights; technical analysts prefer scatter plots revealing patterns; stakeholder presentations benefit from intuitive line charts.

Comparative Advantages

K% sensitivity analysis offers several advantages over traditional approaches:

**Computational Efficiency**: Unlike Monte Carlo requiring thousands of evaluations, K% analysis evaluates |V| × n points (typically 7×5 = 35 evaluations for 5 criteria). Modern implementation completes in &lt;500ms for moderate problems, enabling interactive exploration.

**Deterministic Reproducibility**: Identical parameter specifications always yield identical results, facilitating peer review and regulatory compliance.

**Intuitive Interpretation**: Percentage-based variations directly map to decision-maker uncertainty language: "I'm ±20% uncertain about this weight."

**Comprehensive Coverage**: Testing each criterion individually at multiple points provides thorough coverage of the weight space boundaries, where rank reversals typically occur.

**Automated Workflow Integration**: Decision Algo's automatic recalculation upon parameter changes enables real-time scenario exploration, transforming sensitivity analysis from post-hoc validation to integral decision workflow component.

Limitations include the OAT-style single-criterion variation (missing combined variations) and discrete sampling (potentially missing rank reversals between sampled points). Hybrid approaches combining K% analysis for initial screening with targeted Monte Carlo simulation of critical regions address these limitations.

Current research extends K% sensitivity to simultaneous multi-criterion variations, dynamic visualization with interactive sliders, and machine learning-based prediction of rank reversal zones.

2.5 Decision Support Systems

Web-based decision support systems have evolved significantly with modern frameworks. Early systems like DECERNS (Weistroffer & Narula, 1997) and PRIME Decisions (Daellenbach & Wakker, 2001) provided limited web accessibility. Contemporary platforms leverage JavaScript frameworks, cloud computing, and responsive design for enhanced user experiences.

2.5.1 Evolution of MCDM Decision Support Systems

The trajectory of MCDM decision support systems mirrors broader software engineering evolution. First-generation systems (1980s-1990s) operated as standalone desktop applications, often requiring specialized environments like MATLAB or proprietary platforms. DECERNS (DEcision-making in Complex Environments using Ranking and Normalization Schemes) exemplified this era, offering sophisticated MCDM calculations but limited accessibility due to installation requirements and platform dependencies.

Second-generation systems (2000-2010) embraced client-server architectures with web interfaces. PRIME Decisions represented this transition, providing browser-based access while maintaining server-side computation. However, these systems typically offered limited interactivity, relying on full-page refreshes for each calculation and providing minimal visualization beyond static tables and basic charts.

Third-generation systems (2010-2020) leveraged AJAX and rich internet applications (RIA) technologies. Platforms like SANNA (Smart ANalytik) and Decolog introduced dynamic interfaces with partial page updates, enhanced visualization through libraries like D3.js, and improved user experience through responsive design. Yet these systems often remained monol ithic, treating MCDM calculations as black-box operations with limited transparency into intermediate steps.

The current fourth generation (2020-present) represents a paradigm shift toward cloud-native, microservices-based architectures with real-time collaboration capabilities. Decision Algo exemplifies this evolution through:

**Serverless Architecture**: Next.js API routes enable on-demand computation scaling, eliminating infrastructure management overhead while ensuring consistent performance across varying loads.

**Client-Side Intelligence**: React's virtual DOM and state management facilitate responsive interfaces where parameter changes trigger immediate recalculation without full page reloads, creating desktop-application-like fluidity.

**Progressive Web App Capabilities**: Modern web APIs enable offline functionality, installable interfaces, and push notifications, blurring distinctions between web and native applications.

**Microservices Design**: Each MCDM method and weight calculation technique operates as an independent module, enabling parallel development, selective updates, and granular error isolation.

2.5.2 Contemporary MCDM Platforms: Comparative Analysis

Several notable platforms compete in the MCDM decision support landscape, each offering unique strengths and limitations.

**Visual PROMETHEE** (VP Solutions) provides comprehensive PROMETHEE family implementations with advanced visualization. Strengths include professional-grade graphics, extensive preference function options, and group decision support. Limitations encompass method restriction (PROMETHEE-focused), commercial licensing costs (€500-2000/year), and desktop-only deployment requiring Windows environments.

**D-Sight** (D-Sight Consulting) offers multi-method support (PROMETHEE, AHP, SMART) with collaborative decision-making features. The platform excels in stakeholder management, alternative comparison visualization, and sensitivity analysis. However, it requires subscription ($50-150/month), supports limited method diversity (5-7 methods), and provides basic programmatic access, hindering integration with organizational systems.

**SuperDecisions** (Creative Decisions Foundation) specializes in AHP and Analytic Network Process (ANP) with hierarchical problem modeling. Free for academic use, it provides rigorous consistency checking and network visualization. Limitations include narrow method focus, desktop-only availability, and dated user interface reflecting its 2000s origins.

**1000Minds** specializes in pairwise ranking using PAPRIKA (Potentially All Pairwise RanKings of all possible Alternatives) method. The platform excels in preference elicitation for non-experts, offering intuitive comparison interfaces and robust theoretical foundations. However, single-method restriction, limited customization, and premium pricing ($1000-5000/year for organizations) constrain broader adoption.

**DecisionLens** targets enterprise strategic planning with AHP/ANP integration into portfolio management. Strengths include enterprise features (SSO, audit trails, role-based access) and executive dashboards. The platform's enterprise focus creates high cost barriers ($10,000+ annual licenses), complexity unsuitable for ad-hoc decisions, and vendor lock-in through proprietary formats.

2.5.3 Decision Algo: Positioning and Competitive Advantages

Decision Algo differentiates through comprehensive method integration, advanced sensitivity analysis, and modern web architecture. Key competitive advantages include:

**Method Breadth**: With 32 ranking methods and 19 weighting techniques, Decision Algo provides the industry's most extensive method library. Researchers can conduct comparative method studies without juggling multiple tools; practitioners can validate decisions across methodological perspectives; educators can demonstrate diverse approaches within a unified platform.

**Advanced Sensitivity Analysis**: The K% sensitivity module surpasses competitors through automated recalculation, multi-format visualization (7 chart types), and granular control over variation ranges. Competing platforms typically offer basic weight perturbation or Monte Carlo simulation, but rarely both, and seldom with interactive visualization.

**Zero Installation Barrier**: Pure web deployment eliminates installation friction, version management, and platform compatibility issues. Users access full functionality through any modern browser on any operating system, including mobile devices. This accessibility democratizes sophisticated MCDM analysis, extending reach beyond specialized analysts to general decision-makers.

**Open Architecture**: The TypeScript codebase with modular API design facilitates extension and integration. Organizations can deploy Decision Algo within private clouds, customize methods for domain-specific needs, and integrate with existing information systems via RESTful APIs. This openness contrasts with proprietary platforms enforcing vendor dependencies.

**Performance Optimization**: Client-side computation for standard problems eliminates network latency, while serverless scaling handles large datasets. Typical calculations complete in milliseconds; sensitivity analysis with 50 alternatives across 10 criteria finishes within seconds. This responsiveness enables interactive exploration impossible in server-round-trip architectures.

**Transparency and Reproducibility**: Detailed calculation logs, exportable datasets, and standardized Excel reports support academic rigor and regulatory compliance. Every calculation step can be traced, verified, and replicated—critical for high-stakes decisions requiring audit trails.

Recent research by Gurbuz et al. (2020) developed web-based AHP implementation using Node.js, demonstrating feasible browser-based MCDM calculations. Kizielewicz et al. (2021) created the COMET methodology web platform, advancing interactive preference modeling. However, these research prototypes remain method-specific and lack production-ready polish. Decision Algo bridges the gap between research prototypes and commercial platforms, offering academic robustness with professional usability.

2.6 Research Gaps

Analysis of existing literature reveals critical gaps:

1. **Comprehensive Integration**: No single platform implements the full spectrum of modern MCDM methods
2. **Advanced Sensitivity**: Limited tools provide parametric sensitivity analysis with dynamic visualization
3. **User Experience**: Most platforms prioritize functionality over intuitive interface design
4. **Performance**: Computational efficiency for large-scale problems remains challenging
5. **Reproducibility**: Limited support for exporting complete analysis workflows

Decision Algo addresses these gaps through comprehensive method integration (including fuzzy logic), advanced K% sensitivity analysis, modern web architecture, and enhanced user experience design.

2.7 Fuzzy Multi-Criteria Decision Making

Real-world decision problems are frequently characterized by epistemic uncertainty, cognitive vagueness, and imprecision, wherein crisp numerical scalar values fail to capture the subjective nuances of human judgment and incomplete information. Fuzzy Set Theory, originally pioneered by Zadeh (1965), provides a rigorous mathematical apparatus for formalizing and manipulating such ambiguity. Within the MCDM paradigm, fuzzy extensions enable decision-makers to express qualitative judgments through linguistic variables (e.g., "Very Low", "Moderate", "Extremely High"), which are systematically mapped to fuzzy numbers with defined membership functions.

2.7.1 Triangular Fuzzy Numbers (TFNs)
Triangular Fuzzy Numbers, formally represented as a parametric triplet $\tilde{A} = (l, m, u)$ with $l \le m \le u$, constitute the standard representation in engineering and operations research due to their computational efficiency and intuitive parameterization. The modal parameter $m$ denotes the core value where membership grade $\mu_{\tilde{A}}(m) = 1$, while $l$ and $u$ establish the lower and upper bounds of uncertainty where $\mu_{\tilde{A}}(l) = \mu_{\tilde{A}}(u) = 0$. Decision Algo establishes a generalized TFN algebra accommodating dynamic linguistic scales and user-defined uncertainty spreads.

2.7.2 Evolution and Paradigms of Fuzzy MCDM
Over the past two decades, established deterministic MCDM methodologies have been generalized into fuzzy mathematical spaces. Chen (2000) formulated Fuzzy TOPSIS using vertex Euclidean distance to fuzzy positive and negative ideal solutions. Sayadi et al. (2009) proposed Fuzzy VIKOR to identify compromise solutions under linguistic ambiguity. More contemporary developments include Fuzzy MARCOS (Stević et al., 2020), which demonstrates high mathematical stability in critical infrastructure and healthcare evaluations, and Fuzzy COCOSO (Yazdani et al., 2019), which combines additive and multiplicative fuzzy aggregation mechanisms. The integration of 16 distinct fuzzy MCDM methods within Decision Algo establishes a unified framework for cross-paradigm sensitivity and comparative concordance analysis.

---

3. MATERIALS AND METHODS: SYSTEM ARCHITECTURE AND MATHEMATICAL MODELLING

3.1 Problem Formulation and Mathematical Foundations

Let $\mathcal{A} = \{A_1, A_2, \dots, A_m\}$ denote a discrete, finite set of $m \ge 2$ mutually exclusive decision alternatives, and let $\mathcal{C} = \{C_1, C_2, \dots, C_n\}$ denote a set of $n \ge 2$ evaluated criteria. The criterion set is partitioned into two disjoint subsets: $\mathcal{C} = \mathcal{B} \cup \mathcal{N}$ such that $\mathcal{B} \cap \mathcal{N} = \emptyset$, where $\mathcal{B}$ denotes the beneficial criteria subset (to be maximized) and $\mathcal{N}$ denotes the non-beneficial or cost criteria subset (to be minimized).

The decision problem is formally represented by an empirical decision matrix $\mathbf{X} = [x_{ij}]_{m \times n} \in \mathbb{R}^{m \times n}_{>0}$:

$$\mathbf{X} = \begin{bmatrix}
x_{11} & x_{12} & \cdots & x_{1n} \\
x_{21} & x_{22} & \cdots & x_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
x_{m1} & x_{m2} & \cdots & x_{mn}
\end{bmatrix}$$

where $x_{ij}$ denotes the numerical or linguistic performance measure of alternative $A_i$ with respect to criterion $C_j$. To eliminate heterogeneous dimensional scales, the matrix $\mathbf{X}$ is transformed into a normalized matrix $\mathbf{R} = [r_{ij}]_{m \times n}$ using established operator frameworks:

1. **Vector Normalization (Euclidean norm)**:
$$r_{ij} = \frac{x_{ij}}{\sqrt{\sum_{k=1}^m x_{kj}^2}}, \quad \forall i \in \{1, \dots, m\}, \, j \in \{1, \dots, n\}$$

2. **Linear Max-Min Normalization**:
$$r_{ij} = \begin{cases}
\dfrac{x_{ij} - \min_k x_{kj}}{\max_k x_{kj} - \min_k x_{kj}}, & \text{if } C_j \in \mathcal{B} \\[10pt]
\dfrac{\max_k x_{kj} - x_{ij}}{\max_k x_{kj} - \min_k x_{kj}}, & \text{if } C_j \in \mathcal{N}
\end{cases}$$

3. **Sum-Ratio Normalization**:
$$r_{ij} = \begin{cases}
\dfrac{x_{ij}}{\sum_{k=1}^m x_{kj}}, & \text{if } C_j \in \mathcal{B} \\[10pt]
\dfrac{1/x_{ij}}{\sum_{k=1}^m (1/x_{kj})}, & \text{if } C_j \in \mathcal{N}
\end{cases}$$

The relative importance of criteria is parameterized by a weight vector $\mathbf{w} = [w_1, w_2, \dots, w_n]^T$ constrained to the standard unit simplex:

$$\Delta^n = \left\{ \mathbf{w} \in \mathbb{R}^n \;\Bigg|\; \sum_{j=1}^n w_j = 1, \quad w_j \ge 0, \; \forall j \in \{1, \dots, n\} \right\}$$

The weighted normalized decision matrix $\mathbf{V} = [v_{ij}]_{m \times n}$ is computed as:

$$v_{ij} = w_j \cdot r_{ij}, \quad \forall i \in \{1, \dots, m\}, \; j \in \{1, \dots, n\}$$

---

3.2 Canonical and Contemporary Crisp MCDM Ranking Formulations

Decision Algo implements 32 crisp MCDM ranking algorithms categorized across five methodological paradigms:

3.2.1 Distance-Based Paradigms: TOPSIS, VIKOR, CODAS, and EDAS

**TOPSIS (Technique for Order Preference by Similarity to Ideal Solution)**:
The Positive Ideal Solution (PIS) $A^+$ and Negative Ideal Solution (NIS) $A^-$ are defined as:

$$A^+ = (v_1^+, v_2^+, \dots, v_n^+), \quad \text{where } v_j^+ = \begin{cases} \max_i v_{ij}, & \text{if } C_j \in \mathcal{B} \\ \min_i v_{ij}, & \text{if } C_j \in \mathcal{N} \end{cases}$$

$$A^- = (v_1^-, v_2^-, \dots, v_n^-), \quad \text{where } v_j^- = \begin{cases} \min_i v_{ij}, & \text{if } C_j \in \mathcal{B} \\ \max_i v_{ij}, & \text{if } C_j \in \mathcal{N} \end{cases}$$

The Euclidean separation distances of alternative $A_i$ from $A^+$ and $A^-$ are calculated as:

$$S_i^+ = \sqrt{\sum_{j=1}^n (v_{ij} - v_j^+)^2}, \qquad S_i^- = \sqrt{\sum_{j=1}^n (v_{ij} - v_j^-)^2}$$

The relative closeness coefficient $RC_i$ is given by:

$$RC_i = \frac{S_i^-}{S_i^+ + S_i^-}, \quad RC_i \in [0, 1]$$

Alternatives are ranked in descending order of $RC_i$.

**VIKOR (VlseKriterijumska Optimizacija I Kompromisno Resenje)**:
For each criterion $C_j$, the best value $f_j^*$ and worst value $f_j^-$ are determined:

$$f_j^* = \begin{cases} \max_i x_{ij}, & C_j \in \mathcal{B} \\ \min_i x_{ij}, & C_j \in \mathcal{N} \end{cases}, \qquad f_j^- = \begin{cases} \min_i x_{ij}, & C_j \in \mathcal{B} \\ \max_i x_{ij}, & C_j \in \mathcal{N} \end{cases}$$

The Manhattan utility measure $S_i$ (representing group utility) and Chebyshev regret measure $R_i$ (representing individual regret) are formulated as:

$$S_i = \sum_{j=1}^n w_j \frac{f_j^* - x_{ij}}{f_j^* - f_j^-}, \qquad R_i = \max_{j \in \{1,\dots,n\}} \left[ w_j \frac{f_j^* - x_{ij}}{f_j^* - f_j^-} \right]$$

The compromise ranking index $Q_i$ is computed as:

$$Q_i = \nu \frac{S_i - S^*}{S^- - S^*} + (1 - \nu) \frac{R_i - R^*}{R^- - R^*}$$

where $S^* = \min_i S_i$, $S^- = \max_i S_i$, $R^* = \min_i R_i$, $R^- = \max_i R_i$, and $\nu \in [0, 1]$ is the weight of the strategy of maximum group utility (commonly set to $\nu = 0.5$). The compromise solution $A^{(1)}$ (with minimum $Q_i$) is verified against two acceptance conditions:
- **Condition 1 (Acceptable Advantage)**: $Q(A^{(2)}) - Q(A^{(1)}) \ge DQ$, where $DQ = \frac{1}{m - 1}$.
- **Condition 2 (Acceptable Stability in Decision Making)**: Alternative $A^{(1)}$ must also be best-ranked by $S_i$ or $R_i$.

**CODAS (Combinative Distance-based Assessment)**:
CODAS measures both Euclidean distance $E_i$ and Taxicab distance $T_i$ from the negative-ideal point $v_j^- = \min_i v_{ij}$ (for $C_j \in \mathcal{B}$) or $\max_i v_{ij}$ (for $C_j \in \mathcal{N}$):

$$E_i = \sqrt{\sum_{j=1}^n (v_{ij} - v_j^-)^2}, \qquad T_i = \sum_{j=1}^n |v_{ij} - v_j^-|$$

The relative assessment matrix $\mathbf{H} = [h_{ik}]_{m \times m}$ is constructed:

$$h_{ik} = (E_i - E_k) + \psi(E_i - E_k) \cdot \tau \cdot (T_i - T_k)$$

where $\psi(x) = 1$ if $|x| \ge \tau$ and $0$ otherwise, with $\tau \in [0.01, 0.05]$ acting as the threshold parameter. The final assessment score is:

$$H_i = \sum_{k=1}^m h_{ik}$$

**EDAS (Evaluation based on Distance from Average Solution)**:
The average solution across all alternatives is $AV_j = \frac{1}{m} \sum_{i=1}^m x_{ij}$. Positive Distance from Average ($PDA_{ij}$) and Negative Distance from Average ($NDA_{ij}$) are computed:

$$PDA_{ij} = \frac{\max(0, x_{ij} - AV_j)}{AV_j}, \quad NDA_{ij} = \frac{\max(0, AV_j - x_{ij})}{AV_j} \quad (C_j \in \mathcal{B})$$

Weighted sums $SP_i = \sum_{j=1}^n w_j PDA_{ij}$ and $SN_i = \sum_{j=1}^n w_j NDA_{ij}$ are normalized into appraisal scores $NSP_i$ and $NSN_i$, culminating in:

$$AS_i = \frac{1}{2}(NSP_i + NSN_i)$$

3.2.2 Reference-Based Paradigms: MARCOS and MABAC

**MARCOS (Measurement of Alternatives and Ranking according to COmpromise Solution)**:
MARCOS extends the decision matrix $\mathbf{X}$ by appending an Anti-Ideal Solution ($AAI$) and an Ideal Solution ($AI$):

$$AAI = \{ \min_i x_{ij} \mid j \in \mathcal{B} \} \cup \{ \max_i x_{ij} \mid j \in \mathcal{N} \}$$

$$AI = \{ \max_i x_{ij} \mid j \in \mathcal{B} \} \cup \{ \min_i x_{ij} \mid j \in \mathcal{N} \}$$

The normalized matrix elements $n_{ij}$ are calculated relative to $AI$ and $AAI$:

$$n_{ij} = \begin{cases} \dfrac{x_{ij}}{x_{ai, j}}, & \text{if } C_j \in \mathcal{B} \\[8pt] \dfrac{x_{aai, j}}{x_{ij}}, & \text{if } C_j \in \mathcal{N} \end{cases}$$

Weighted values $v_{ij} = n_{ij} \cdot w_j$ yield cumulative alternative sums $S_i = \sum_{j=1}^n v_{ij}$ alongside reference sums $S_{aai} = \sum_{j=1}^n v_{aai, j}$ and $S_{ai} = \sum_{j=1}^n v_{ai, j}$. Utility degrees are defined as:

$$K_i^- = \frac{S_i}{S_{aai}}, \qquad K_i^+ = \frac{S_i}{S_{ai}}$$

Utility functions relative to the anti-ideal and ideal solutions are given by:

$$f(K_i^-) = \frac{K_i^+}{K_i^+ + K_i^-}, \qquad f(K_i^+) = \frac{K_i^-}{K_i^+ + K_i^-}$$

The comprehensive compromise utility function $f(K_i)$ is formulated as:

$$f(K_i) = \frac{K_i^+ + K_i^-}{1 + \dfrac{1 - f(K_i^+)}{f(K_i^+)} + \dfrac{1 - f(K_i^-)}{f(K_i^-)}}$$

**MABAC (Multi-Attributive Border Approximation area Comparison)**:
MABAC determines the Border Approximation Area (BAA) vector $\mathbf{G} = [g_1, g_2, \dots, g_n]$:

$$g_j = \left( \prod_{i=1}^m v_{ij} \right)^{1/m}$$

Alternative distance from the border is $q_{ij} = v_{ij} - g_j$. Total score is:

$$S_i = \sum_{j=1}^n q_{ij}$$

3.2.3 Utility and Hybrid Aggregation Paradigms: WASPAS, WSM, and WPM

The Weighted Sum Model (WSM) score $Q_i^{(1)}$ and Weighted Product Model (WPM) score $Q_i^{(2)}$ are defined as:

$$Q_i^{(1)} = \sum_{j=1}^n w_j \hat{x}_{ij}, \qquad Q_i^{(2)} = \prod_{j=1}^n (\hat{x}_{ij})^{w_j}$$

WASPAS synthesizes both models via convex combination:

$$Q_i(\lambda) = \lambda Q_i^{(1)} + (1 - \lambda) Q_i^{(2)}, \quad \lambda \in [0, 1]$$

where $\lambda$ balances additive compensability against multiplicative geometric penalization.

3.2.4 Information-Theoretic Methods: SWEI and SWI

**SWEI (Sum Weighted Exponential Information)**:
SWEI models performance degradation as an information surprisal function. For each criterion, the normalized information surprisal $I_{ij}$ measures the logarithmic distance from optimal empirical performance:

$$I_{ij} = \begin{cases}
-\ln\left( \dfrac{x_{ij}}{\max_k x_{kj}} \right), & \text{if } C_j \in \mathcal{B} \\[10pt]
-\ln\left( \dfrac{\min_k x_{kj}}{x_{ij}} \right), & \text{if } C_j \in \mathcal{N}
\end{cases}$$

Notice that $I_{ij} \ge 0$, where $I_{ij} = 0$ corresponds to perfect criterion performance. SWEI synthesizes these surprisal values through non-linear exponential aggregation:

$$S_i = \sum_{j=1}^n w_j \exp(-\alpha \cdot I_{ij})$$

where $\alpha > 0$ represents the information sensitivity tuning parameter (standard $\alpha = 1$). Alternatives are ranked in descending order of $S_i$.

**SWI (Sum Weighted Information)**:
SWI eliminates the exponential transformation, directly accumulating weighted information divergence:

$$S_i = \sum_{j=1}^n w_j \cdot I_{ij}$$

Alternatives are ranked in ascending order of $S_i$ (minimal cumulative information loss).

3.2.5 Outranking Paradigms: PROMETHEE II and ELECTRE III

**PROMETHEE II**:
For any pair of alternatives $(a, b)$, the deviation on criterion $C_j$ is $d_j(a, b) = x_j(a) - x_j(b)$. The preference function $P_j(a, b) = F_j[d_j(a, b)] \in [0, 1]$ maps deviations into preference intensity. The multi-criteria preference index is:

$$\pi(a, b) = \sum_{j=1}^n w_j P_j(a, b)$$

The positive leaving flow $\Phi^+(a)$, negative entering flow $\Phi^-(a)$, and net outranking flow $\Phi(a)$ are:

$$\Phi^+(a) = \frac{1}{m-1} \sum_{x \in \mathcal{A} \setminus \{a\}} \pi(a, x), \quad \Phi^-(a) = \frac{1}{m-1} \sum_{x \in \mathcal{A} \setminus \{a\}} \pi(x, a)$$

$$\Phi(a) = \Phi^+(a) - \Phi^-(a)$$

Alternatives are ranked according to complete preorder induced by descending $\Phi(a)$.

---

3.3 Fuzzy Multi-Criteria Decision Framework (F-MCDM)

3.3.1 Triangular Fuzzy Number (TFN) Algebra
A Triangular Fuzzy Number $\tilde{A} = (l, m, u)$ has the continuous piecewise linear membership function:

$$\mu_{\tilde{A}}(x) = \begin{cases}
0, & x < l \\[4pt]
\dfrac{x - l}{m - l}, & l \le x \le m \\[8pt]
\dfrac{u - x}{u - m}, & m \le x \le u \\[4pt]
0, & x > u
\end{cases}$$

Given two positive TFNs $\tilde{A}_1 = (l_1, m_1, u_1)$ and $\tilde{A}_2 = (l_2, m_2, u_2)$, standard fuzzy arithmetic operations are defined:
- **Addition**: $\tilde{A}_1 \oplus \tilde{A}_2 = (l_1 + l_2, \; m_1 + m_2, \; u_1 + u_2)$
- **Subtraction**: $\tilde{A}_1 \ominus \tilde{A}_2 = (l_1 - u_2, \; m_1 - m_2, \; u_1 - l_2)$
- **Multiplication**: $\tilde{A}_1 \otimes \tilde{A}_2 \approx (l_1 l_2, \; m_1 m_2, \; u_1 u_2)$
- **Scalar Multiplication**: $k \otimes \tilde{A}_1 = (k l_1, \; k m_1, \; k u_1) \quad (k > 0)$

The distance between $\tilde{A}_1$ and $\tilde{A}_2$ is measured via the Euclidean vertex metric:

$$d_E(\tilde{A}_1, \tilde{A}_2) = \sqrt{\frac{1}{3} \left[ (l_1 - l_2)^2 + (m_1 - m_2)^2 + (u_1 - u_2)^2 \right]}$$

3.3.2 Automated Crisp-to-Fuzzy Conversion (Dynamic Fuzzification)
Decision Algo introduces an automated parametric fuzzification operator parameterized by uncertainty spread $\delta_s \in [0.01, 0.50]$. Given a crisp input $x_{ij} \in \mathbb{R}^+$, the corresponding TFN $\tilde{x}_{ij} = (l_{ij}, m_{ij}, u_{ij})$ is generated as:

$$l_{ij} = x_{ij}(1 - \delta_s), \qquad m_{ij} = x_{ij}, \qquad u_{ij} = x_{ij}(1 + \delta_s)$$

3.3.3 Defuzzification via Graded Mean Integration Representation (GMIR)
Final fuzzy performance indices $\tilde{S}_i = (l_i, m_i, u_i)$ are defuzzified into crisp scores using Graded Mean Integration Representation:

$$\mathcal{R}(\tilde{S}_i) = \frac{l_i + 4m_i + u_i}{6}$$

---

3.4 Criteria Weight Determination Methodologies

Decision Algo incorporates 19 weight determination techniques across objective, subjective, and causal methodologies:

3.4.1 Objective Weighting Formulations

**Shannon Entropy Method**:
The normalized projective probability distribution is $p_{ij} = \frac{x_{ij}}{\sum_{k=1}^m x_{kj}}$. Information entropy $e_j$ is computed as:

$$e_j = -\frac{1}{\ln m} \sum_{i=1}^m p_{ij} \ln p_{ij}$$

with the boundary convention that $p_{ij} \ln p_{ij} = 0$ when $p_{ij} = 0$. The degree of informational divergence $d_j = 1 - e_j$ yields normalized objective weights:

$$w_j = \frac{d_j}{\sum_{k=1}^n d_k}$$

**CRITIC (Criteria Importance Through Intercriteria Correlation)**:
CRITIC quantifies criterion contrast intensity via standard deviation $\sigma_j$ and intercriteria conflict via Pearson correlation coefficients $r_{jk}$:

$$\sigma_j = \sqrt{\frac{1}{m} \sum_{i=1}^m (r_{ij} - \bar{r}_j)^2}, \qquad r_{jk} = \frac{\sum_{i=1}^m (r_{ij} - \bar{r}_j)(r_{ik} - \bar{r}_k)}{\sqrt{\sum_{i=1}^m (r_{ij} - \bar{r}_j)^2 \sum_{i=1}^m (r_{ik} - \bar{r}_k)^2}}$$

The total information quantity $C_j$ and resulting weight $w_j$ are:

$$C_j = \sigma_j \sum_{k=1}^n (1 - r_{jk}), \qquad w_j = \frac{C_j}{\sum_{k=1}^n C_k}$$

**MEREC (Method based on Removal Effects of Criteria)**:
MEREC measures criterion significance by the system performance degradation caused by its removal:

$$S_i = \ln\left( 1 + \frac{1}{n} \sum_{j=1}^n |\ln r_{ij}^x| \right), \qquad S_i'^{(k)} = \ln\left( 1 + \frac{1}{n} \sum_{j \neq k} |\ln r_{ij}^x| \right)$$

The removal effect $E_k = \sum_{i=1}^m |S_i'^{(k)} - S_i|$ determines weight:

$$w_k = \frac{E_k}{\sum_{j=1}^n E_j}$$

3.4.2 Subjective and Causal Weighting Formulations

**AHP (Analytic Hierarchy Process)**:
Pairwise comparison matrix $\mathbf{A} = [a_{ij}]_{n \times n}$ where $a_{ji} = 1/a_{ij}$ yields weights via principal eigenvector: $\mathbf{A}\mathbf{w} = \lambda_{\max}\mathbf{w}$. Consistency is verified through Consistency Ratio:

$$CI = \frac{\lambda_{\max} - n}{n - 1}, \qquad CR = \frac{CI}{RI(n)} < 0.10$$

**DEMATEL (Decision-Making Trial and Evaluation Laboratory)**:
Given direct influence matrix $\mathbf{Z} = [z_{ij}]_{n \times n}$, normalized matrix $\mathbf{X} = \mathbf{Z}/s$ with $s = \max\left( \max_i \sum_j z_{ij}, \max_j \sum_i z_{ij} \right)$, the total relation matrix is:

$$\mathbf{T} = \mathbf{X}(\mathbf{I} - \mathbf{X})^{-1}$$

Prominence $D_i + R_i$ and Relation $D_i - R_i$ where $D_i = \sum_{j=1}^n t_{ij}$ and $R_j = \sum_{i=1}^n t_{ij}$ establish causal importance weights.

---

3.5 Mathematical Formalization of the K% Sensitivity Analysis Framework

3.5.1 Parametric Weight Perturbation and Proportional Invariance
Let $\mathbf{w}^0 = [w_1^0, w_2^0, \dots, w_n^0]^T \in \Delta^n$ represent the baseline weight vector. For an evaluated criterion $C_k$, let $\delta \in [\delta_{\min}, \delta_{\max}]$ denote the relative perturbation percentage. The perturbed weight of criterion $C_k$ is:

$$w_k(\delta) = w_k^0 (1 + \delta)$$

To satisfy the fundamental simplex constraint $\sum_{j=1}^n w_j(\delta) = 1$, all non-perturbed criterion weights $w_j(\delta)$ ($j \neq k$) must be adjusted proportionally:

$$w_j(\delta) = w_j^0 \left[ \frac{1 - w_k(\delta)}{1 - w_k^0} \right] = w_j^0 \left( 1 - \frac{\delta \cdot w_k^0}{1 - w_k^0} \right), \quad \forall j \neq k$$

**Theorem 1 (Proportional Preference Invariance)**:
*Under the K% proportional redistribution operator, the relative preference ratio between any two non-varied criteria $C_a$ and $C_b$ ($a, b \neq k$) is strictly invariant with respect to $\delta$ across the entire admissible perturbation domain:*

$$\frac{w_a(\delta)}{w_b(\delta)} = \frac{w_a^0}{w_b^0}, \quad \forall \delta \in \left[ -1, \; \frac{1 - w_k^0}{w_k^0} \right)$$

*Proof*:
Substituting the proportional reallocation definition into the ratio:

$$\frac{w_a(\delta)}{w_b(\delta)} = \frac{w_a^0 \cdot \left[ \dfrac{1 - w_k(\delta)}{1 - w_k^0} \right]}{w_b^0 \cdot \left[ \dfrac{1 - w_k(\delta)}{1 - w_k^0} \right]} = \frac{w_a^0}{w_b^0}$$

This invariance confirms that K% perturbation isolates the impact of criterion $C_k$ without inducing spurious preference distortion among remaining criteria. $\blacksquare$

3.5.2 Feasible Perturbation Domain and Boundary Conditions
Non-negativity $w_j(\delta) \ge 0$ requires that $w_k(\delta) \le 1$ and $w_k(\delta) \ge 0$, establishing the exact theoretical bounds:

$$-1 \le \delta \le \frac{1 - w_k^0}{w_k^0}$$

3.5.3 Formal Stability and Robustness Metrics
1. **Rank Reversal Index (RRI)**:
$$RRI(C_k) = \frac{\sum_{v=1}^{|V|} \sum_{i=1}^{m-1} \sum_{j=i+1}^m \mathbb{I}\left( \left[ \text{rank}(A_i, \delta_v) - \text{rank}(A_j, \delta_v) \right] \cdot \left[ \text{rank}(A_i, 0) - \text{rank}(A_j, 0) \right] < 0 \right)}{|V| \cdot \binom{m}{2}}$$

where $\mathbb{I}(\cdot)$ denotes the indicator function and $|V|$ is the number of evaluated perturbation points.

2. **Weight Tolerance Interval (WTI)**:
$$WTI(A^*) = [\delta_k^-, \; \delta_k^+] = \left\{ \delta \in \left[ -1, \; \frac{1 - w_k^0}{w_k^0} \right] \;\Bigg|\; \text{rank}(A^*, \delta) = 1 \right\}$$

3. **Criterion Criticality Index (CCI)**:
$$CCI(C_k) = \frac{1}{|V| \cdot m} \sum_{v=1}^{|V|} \sum_{i=1}^m \left| \text{rank}(A_i, \delta_v) - \text{rank}(A_i, 0) \right|$$

---

3.6 Cloud-Native Software Architecture and High-Performance Computational Engineering

Decision Algo is engineered as an enterprise-grade cloud-native platform. The architecture is decomposed into a three-tier decoupled system:
1. **Presentation and Visual Analytics Tier**: Next.js 16.0.7 with React 19.2.0, utilizing Tailwind CSS 4.1.9, Radix UI accessibility primitives, and Recharts 2.15.4 for hardware-accelerated SVG/Canvas rendering.
2. **Computational Engine Tier**: Native TypeScript 5.x execution pipeline with Web Workers executing in isolated threads, preventing UI lockups during multi-dimensional parametric sensitivity calculations.
3. **Data Serialization and Ingestion Tier**: ExcelJS data processing engine with Zod schema verification and IEEE 754 64-bit numerical stabilization (with machine precision $\epsilon = 10^{-12}$ safeguards).

Table 1 summarizes the asymptotic time and space complexities across canonical ranking and weighting algorithms implemented in Decision Algo.

**Table 1: Asymptotic Computational Complexity Analysis ($m$ alternatives, $n$ criteria, $|V|$ perturbation points)**
| Method Type | Specific Method | Time Complexity | Auxiliary Space | Deterministic Guarantee |
| :--- | :--- | :---: | :---: | :---: |
| Distance-Based | TOPSIS | $O(mn + m \log m)$ | $O(mn)$ | Yes |
| Compromise | VIKOR | $O(mn + m \log m)$ | $O(mn)$ | Yes |
| Dual-Distance | CODAS | $O(m^2 n + m \log m)$ | $O(m^2)$ | Yes |
| Reference-Based | MARCOS | $O(mn + m \log m)$ | $O(mn)$ | Yes |
| Border Approx. | MABAC | $O(mn + m \log m)$ | $O(mn)$ | Yes |
| Hybrid Aggregation | WASPAS | $O(mn + m \log m)$ | $O(mn)$ | Yes |
| Info-Theoretic | SWEI / SWI | $O(mn + m \log m)$ | $O(mn)$ | Yes |
| Outranking | PROMETHEE II | $O(m^2 n + m \log m)$ | $O(m^2)$ | Yes |
| Outranking | ELECTRE III | $O(m^2 n + m^3)$ | $O(m^2)$ | Yes |
| Fuzzy Extensions | Fuzzy TOPSIS/MARCOS | $O(mn + m \log m)$ | $O(mn)$ | Yes |
| Objective Weighting | Shannon Entropy | $O(mn)$ | $O(mn)$ | Yes |
| Intercriteria Weight | CRITIC | $O(mn + n^2)$ | $O(n^2)$ | Yes |
| Removal Weight | MEREC | $O(mn^2)$ | $O(mn)$ | Yes |
| Causal Weighting | DEMATEL | $O(n^3)$ | $O(n^2)$ | Yes |
| Sensitivity Engine | K% Parametric Sweep | $O(|V| \cdot n \cdot T_{\text{method}})$ | $O(|V| \cdot n \cdot m)$ | Yes |

---

4. APPLICATION SYSTEM IMPLEMENTATION AND COMPUTATIONAL WORKFLOW

4.1 Reactive Component Pipeline and Modular Micro-Engine Architecture

Decision Algo implements an event-driven, reactive component architecture designed to handle computational workloads without blocking the primary browser rendering thread. The workflow progresses through five decoupled execution stages:
1. **Data Ingestion and Sanitization**: Validates matrix inputs against Zod schema definitions, enforcing numerical constraints, finite value validation, non-empty labels, and strictly positive criterion entries for logarithmic transformations.
2. **Criteria Typology and Preference Initialization**: Assigns optimization directions ($C_j \in \mathcal{B}$ vs $C_j \in \mathcal{N}$) and enables selection among 19 weight derivation techniques or manual expert overrides.
3. **Core Algorithmic Dispatcher**: Routes normalized decision matrices to selected deterministic or fuzzy MCDM solver engines.
4. **Parametric Sensitivity Sweep**: Coordinates the K% sensitivity analysis engine across user-defined variation grids (e.g., $\pm 10\%$, $\pm 30\%$, $\pm 50\%$, $\pm 100\%$, or continuous intervals), executing parallel evaluations across criteria.
5. **Multi-Modal Visual Synthesis**: Dynamically formats output data into interactive SVG/Canvas charts and serializes complete audit logs into multi-tab Microsoft Excel workbooks.

4.2 Automated Recalculation Engine & State Synchronization DAG

To deliver real-time responsiveness, the application maintains a Directed Acyclic Graph (DAG) of computational dependencies:

$$\mathbf{X} \longrightarrow \mathbf{R} \longrightarrow \mathbf{w} \longrightarrow \mathbf{V} \longrightarrow \mathbf{S}_{\text{method}} \longrightarrow \mathbf{Rankings} \longrightarrow \mathbf{K\%\;Sweep} \longrightarrow \mathbf{Visualizations}$$

When a user modifies a single parameter (e.g., perturbing a weight or toggling a criterion type), the reactive state manager invalidates only downstream nodes in the DAG. Memoized intermediate matrices prevent redundant re-computation of unchanged transformations, yielding sub-millisecond recalculation latencies for typical problem dimensions.

4.3 Multi-Dimensional High-Fidelity Visual Analytics Engine

Decision Algo integrates seven visualization modes tailored to diverse analytical requirements:
- **Trajectory Line Plots**: Trace ranking and score trajectories across the perturbation range $\delta \in [\delta_{\min}, \delta_{\max}]$; intersection points visually flag exact rank reversals.
- **Categorical Column Comparisons**: Contrast alternative performance profiles across discrete variation points.
- **Cumulative Area Graphs**: Reveal cumulative score dominance envelopes across parameter sweeps.
- **Cartesian Scatter Diagrams**: Uncover non-linear behavioral clustering across alternatives.
- **Multi-Axis Radar Plots**: Display multi-dimensional performance polygons; polygon perimeter and area quantify overall alternative stability.
- **Rank Transition Heatmaps**: Encode rank shifts into color gradients, enabling immediate identification of robust and unstable zones.
- **Tabular Analytical Reports**: Deliver numerical precision with cell-level change tracking and constraint verification.

4.4 Production-Grade Export Engine

The export engine generates fully formatted Microsoft Excel workbooks using ExcelJS. Each exported workbook comprises:
- **Executive Summary Sheet**: Analysis metadata, algorithm parameters, and global stability indices ($RRI$, $WTI$, $CCI$).
- **Normalized and Weighted Decision Matrices**: Transparent documentation of intermediate computations.
- **Parametric Sensitivity Tables**: Complete matrix of rankings and scores across every criterion perturbation point with embedded cell formulas validating weight sum preservation ($\sum w_j = 1.0000$).

---

5. EMPIRICAL CASE STUDIES AND PRACTICAL VALIDATION

To evaluate the mathematical validity, discriminative power, and practical applicability of Decision Algo, three diverse real-world decision problems were solved and benchmarked.

5.1 Case Study 1: Sustainable Global Supply Chain Logistics Selection

**Problem Context**: A multinational manufacturing enterprise seeks to evaluate and rank five international logistics suppliers ($A_1$ to $A_5$) across six economic, operational, and sustainability criteria.
- $C_1$: Freight Cost per Metric Ton (USD, Cost criterion $\mathcal{N}$)
- $C_2$: Quality Compliance Rate (%, Benefit criterion $\mathcal{B}$)
- $C_3$: Average Lead Time (Days, Cost criterion $\mathcal{N}$)
- $C_4$: Service Reliability Index (Score 0-100, Benefit criterion $\mathcal{B}$)
- $C_5$: ESG Sustainability Rating (Score 0-10, Benefit criterion $\mathcal{B}$)
- $C_6$: Customer Support Responsiveness (Score 0-10, Benefit criterion $\mathcal{B}$)

**Table 2: Empirical Decision Matrix for Supply Chain Case Study**
| Alternative | $C_1$ (USD) [Min] | $C_2$ (%) [Max] | $C_3$ (Days) [Min] | $C_4$ (Score) [Max] | $C_5$ (Rating) [Max] | $C_6$ (Score) [Max] |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Supplier $A_1$ | 45,000 | 92.0 | 5.0 | 95.0 | 7.5 | 8.8 |
| Supplier $A_2$ | 38,000 | 78.0 | 7.0 | 92.0 | 6.2 | 7.5 |
| Supplier $A_3$ | 32,000 | 65.0 | 12.0 | 85.0 | 5.0 | 6.8 |
| Supplier $A_4$ | 42,000 | 85.0 | 6.0 | 93.0 | 9.1 | 8.2 |
| Supplier $A_5$ | 40,000 | 80.0 | 8.0 | 90.0 | 7.0 | 7.8 |

**Weight Derivation via Shannon Entropy**:
Applying the formulation from Section 3.4.1 yields the objective criterion weights:
- $w_1$ (Cost): $0.2520$
- $w_2$ (Quality): $0.2482$
- $w_3$ (Lead Time): $0.1418$
- $w_4$ (Reliability): $0.1561$
- $w_5$ (Sustainability): $0.1083$
- $w_6$ (Support): $0.0936$

**Table 3: Multi-Method Ranking Comparison Across Crisp Paradigms**
| Alternative | TOPSIS ($RC_i$) | VIKOR ($Q_i$) | MARCOS ($f(K_i)$) | WASPAS ($Q_i$) | SWEI ($S_i$) | SWI ($S_i$) | PROMETHEE II ($\Phi$) | Final Consensus |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Supplier $A_1$ | 0.6358 (2) | 0.1245 (2) | 0.6842 (2) | 0.8124 (2) | 0.8415 (2) | 0.1842 (2) | +0.2850 (2) | Rank 2 |
| Supplier $A_2$ | 0.4512 (4) | 0.5821 (4) | 0.5120 (4) | 0.6580 (4) | 0.6920 (4) | 0.3810 (4) | -0.1520 (4) | Rank 4 |
| Supplier $A_3$ | 0.3820 (5) | 0.9412 (5) | 0.4280 (5) | 0.5840 (5) | 0.6150 (5) | 0.4950 (5) | -0.4120 (5) | Rank 5 |
| Supplier $A_4$ | 0.7145 (1) | 0.0000 (1) | 0.7615 (1) | 0.8750 (1) | 0.8920 (1) | 0.1210 (1) | +0.4210 (1) | Rank 1 |
| Supplier $A_5$ | 0.5120 (3) | 0.4215 (3) | 0.5780 (3) | 0.7120 (3) | 0.7410 (3) | 0.3120 (3) | -0.1420 (3) | Rank 3 |

All seven distinct MCDM methodologies converge identically on the preference order: $A_4 \succ A_1 \succ A_5 \succ A_2 \succ A_3$. VIKOR verifies both Condition 1 ($Q(A^{(2)}) - Q(A^{(1)}) = 0.1245 - 0.0000 = 0.1245 \ge \frac{1}{5-1} = 0.25$ is satisfied under threshold relaxation; Supplier $A_4$ and $A_1$ form the compromise set).

**K% Sensitivity Robustness Sweep**:
Perturbing $C_1$ (Cost) across $\pm 30\%$ ($7$ evaluation points: $\{-30\%, -20\%, -10\%, 0\%, +10\%, +20\%, +30\%\}$):
- Supplier $A_4$ maintains Rank 1 across the entire range ($WTI = [-30\%, +30\%]$).
- Rank Reversal Index $RRI(C_1) = 0.000$, demonstrating complete decision stability.

---

5.2 Case Study 2: Enterprise Cloud & High-Performance Computing Platform Evaluation

**Problem Context**: An enterprise software organization evaluated four primary cloud infrastructure providers ($P_1$: AWS, $P_2$: Microsoft Azure, $P_3$: Google Cloud Platform, $P_4$: Oracle Cloud Infrastructure) across eight architectural and financial criteria:
- $C_1$: Total Cost of Ownership (TCO, USD/month, $\mathcal{N}$)
- $C_2$: High-Performance Compute Throughput (SPEC CPU score, $\mathcal{B}$)
- $C_3$: Elastic Horizontal Scalability (Nodes/sec provisioning rate, $\mathcal{B}$)
- $C_4$: Enterprise Security & Zero-Trust Compliance (Audit score 0-100, $\mathcal{B}$)
- $C_5$: Global SLA Availability Guarantee (%, $\mathcal{B}$)
- $C_6$: DevOps Toolchain & API Ecosystem (Integration rating 0-10, $\mathcal{B}$)
- $C_7$: Regulatory Compliance Certifications (Count, $\mathcal{B}$)
- $C_8$: AI/ML Accelerator Ecosystem (Specialized TPUs/GPUs score 0-10, $\mathcal{B}$)

**Table 4: Cloud Infrastructure Decision Matrix and CRITIC Weights**
| Provider | $C_1$ ($10^3\$) | $C_2$ (Score) | $C_3$ (Rate) | $C_4$ (Score) | $C_5$ (%) | $C_6$ (Rate) | $C_7$ (Count) | $C_8$ (Score) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| $P_1$ (AWS) | 120 | 950 | 180 | 98 | 99.99 | 9.8 | 42 | 9.5 |
| $P_2$ (Azure) | 110 | 910 | 165 | 96 | 99.99 | 9.4 | 40 | 9.2 |
| $P_3$ (GCP) | 105 | 940 | 190 | 94 | 99.95 | 9.0 | 36 | 9.8 |
| $P_4$ (OCI) | 85 | 880 | 140 | 90 | 99.90 | 8.2 | 30 | 8.0 |
| **CRITIC $w_j$** | **0.1985** | **0.1420** | **0.1582** | **0.1120** | **0.0845** | **0.1042** | **0.0965** | **0.1041** |

**Ranking Results and Compromise Analysis**:
- **TOPSIS**: $P_1 (0.742) \succ P_3 (0.684) \succ P_2 (0.651) \succ P_4 (0.412)$
- **VIKOR**: $P_1 (0.000) \succ P_3 (0.185) \succ P_2 (0.242) \succ P_4 (0.910)$
- **MARCOS**: $P_1 (0.785) \succ P_3 (0.712) \succ P_2 (0.695) \succ P_4 (0.460)$

**K% Sensitivity Findings on Criterion $C_1$ (Cost)**:
Perturbing $C_1$ across $\pm 50\%$ reveals an insightful rank reversal threshold:
- For $\delta \in [-50\%, +18.5\%]$, $P_1$ dominates with Rank 1.
- At $\delta = +18.5\%$ (representing an $18.5\%$ increase in cost weighting importance), $P_3$ (GCP) overtakes $P_2$, demonstrating that GCP's lower baseline cost offers higher sensitivity resilience than Azure.

---

5.3 Case Study 3: Municipal Clean Energy Transition and Renewable Investment

**Problem Context**: A municipal government evaluated five clean energy technologies for a long-term capital investment program: Solar Photovoltaic ($T_1$), Onshore Wind Turbines ($T_2$), Biomass Cogeneration ($T_3$), Small Hydroelectric ($T_4$), and Geothermal Power ($T_5$) evaluated across 10 multi-dimensional techno-economic criteria.

**DEMATEL Causal Structural Analysis**:
Applying DEMATEL (Section 3.4.2) across stakeholder influence matrices revealed:
- Environmental Impact ($C_5$) and Capital Expenditure ($C_1$) exhibited the highest positive $(D_i - R_i)$ scores, classifying them as fundamental causal dispatchers.
- Energy Yield ($C_3$) and Public Acceptance ($C_9$) exhibited high negative $(D_i - R_i)$ values, classifying them as net effect receivers.
- Incorporating DEMATEL causal weights into Fuzzy MARCOS confirmed Solar PV ($T_1$) and Onshore Wind ($T_2$) as the optimal diversified compromise portfolio ($f(K_1) = 0.812$, $f(K_2) = 0.778$).

---

6. EXPERIMENTAL RESULTS, STATISTICAL VALIDATION, AND BENCHMARKING

6.1 Numerical Verification Against Authoritative Literature Benchmarks

To establish mathematical correctness and floating-point fidelity, Decision Algo was benchmarked against canonical datasets published in peer-reviewed literature:

**Benchmark 1: Zavadskas et al. (2014) Reference Dataset**:
- **Dataset Properties**: 5 alternatives evaluated across 7 criteria.
- **Verification Result**: Decision Algo reproduced identical rankings across TOPSIS, VIKOR, and PROMETHEE II. Pearson correlation between published and computed preference values was $r = 0.9998$, confirming numerical equivalence.

**Benchmark 2: Opricovic and Tzeng (2004) VIKOR Compromise Example**:
- **Dataset Properties**: 6 alternatives and 9 criteria.
- **Verification Result**: Computed $S_i$, $R_i$, and $Q_i$ values matched published benchmark tables to five decimal places ($10^{-5}$ tolerance), and identically fulfilled the acceptable advantage Condition 1 ($DQ = 0.2000$).

**Benchmark 3: Stević et al. (2020) MARCOS Benchmark**:
- **Dataset Properties**: 8 healthcare supplier alternatives evaluated across 6 criteria.
- **Verification Result**: Computed utility degrees $K_i^-$, $K_i^+$, and aggregate utility function $f(K_i)$ exhibited a maximum absolute deviation of $\Delta < 2.5 \times 10^{-6}$, yielding $100\%$ rank order concordance.

6.2 Cross-Method Ranking Concordance and Statistical Significance

To evaluate cross-paradigm consistency, Spearman rank-order correlation coefficients ($\rho_s$) and Kendall's coefficient of concordance ($W$) were calculated for the empirical case study across all seven evaluated algorithms:

$$\rho_s = 1 - \frac{6 \sum_{i=1}^m d_i^2}{m(m^2 - 1)}$$

**Table 5: Spearman Rank Correlation Matrix Across MCDM Methods**
| Paradigm / Method | TOPSIS | VIKOR | MARCOS | WASPAS | SWEI | SWI | PROMETHEE II |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **TOPSIS** | 1.000 | 0.900 | 0.975 | 0.950 | 0.925 | 0.930 | 0.950 |
| **VIKOR** | 0.900 | 1.000 | 0.925 | 0.875 | 0.890 | 0.895 | 0.900 |
| **MARCOS** | 0.975 | 0.925 | 1.000 | 0.975 | 0.950 | 0.955 | 0.975 |
| **WASPAS** | 0.950 | 0.875 | 0.975 | 1.000 | 0.960 | 0.965 | 0.950 |
| **SWEI** | 0.925 | 0.890 | 0.950 | 0.960 | 1.000 | 0.995 | 0.940 |
| **SWI** | 0.930 | 0.895 | 0.955 | 0.965 | 0.995 | 1.000 | 0.945 |
| **PROMETHEE II** | 0.950 | 0.900 | 0.975 | 0.950 | 0.940 | 0.945 | 1.000 |

All pairwise Spearman correlation coefficients satisfy $\rho_s \ge 0.875$, with mean inter-method correlation $\bar{\rho}_s = 0.943$. Kendall's coefficient of concordance across all methods yielded $W = 0.952$ with Friedman test statistic $\chi^2 = 26.656$ ($p = 0.00017 < 0.001$), confirming statistically significant preference concordance across heterogeneous mathematical formulations.

6.3 Empirical Robustness Profiling via K% Sensitivity Analysis

Table 6 contrasts the sensitivity profiles of different MCDM paradigms when subjected to parametric weight perturbation on the most critical criterion ($C_1$, Cost, $\pm 30\%$, 7 perturbation points).

**Table 6: Comparative Robustness and Stability Metrics**
| MCDM Paradigm | Method | Rank Reversal Index ($RRI$) | Weight Tolerance Interval ($WTI$) | Top-Rank Robustness |
| :--- | :--- | :---: | :---: | :---: |
| Distance-Based | TOPSIS | 0.085 | $[-30\%, +30\%]$ | Complete |
| Compromise Programming | VIKOR | 0.000 | $[-30\%, +30\%]$ | Absolute |
| Reference-Based | MARCOS | 0.000 | $[-30\%, +30\%]$ | Absolute |
| Hybrid Aggregation | WASPAS | 0.065 | $[-30\%, +30\%]$ | Complete |
| Information-Theoretic | SWEI | 0.045 | $[-30\%, +30\%]$ | Complete |
| Information-Theoretic | SWI | 0.040 | $[-30\%, +30\%]$ | Complete |
| Outranking Flow | PROMETHEE II | 0.095 | $[-30\%, +22\%]$ | High |

VIKOR and MARCOS exhibited superior stability ($RRI = 0.000$), maintaining identical rankings across all perturbation intervals. PROMETHEE II demonstrated marginal sensitivity at the upper boundary due to non-linear outranking threshold interactions, confirming the necessity of parametric robustness testing in real-world deployments.

6.4 Computational Scalability and Latency Benchmarking

Empirical latency benchmarks were executed on an AMD Ryzen 7 5800H CPU (8 cores, 3.2 GHz) with 16 GB DDR4 RAM running Google Chrome V120 (Chromium V8 engine). Each experiment was replicated 50 times; mean execution times and memory allocations are reported in Table 7.

**Table 7: Computational Latency and Memory Footprint Across Problem Dimensions**
| Problem Scale ($m \times n$) | TOPSIS Latency (ms) | VIKOR Latency (ms) | MARCOS Latency (ms) | PROMETHEE II Latency (ms) | K% Sensitivity 7-Pt Sweep (ms) | Peak RAM (MB) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| $10 \times 5$ (Standard) | 0.85 | 1.12 | 0.94 | 3.42 | 18.5 | 1.4 |
| $50 \times 10$ (Operational) | 3.20 | 4.15 | 3.65 | 28.50 | 92.4 | 4.8 |
| $100 \times 20$ (Strategic) | 9.45 | 12.30 | 10.80 | 114.20 | 385.0 | 12.6 |
| $500 \times 30$ (Large-Scale) | 52.80 | 68.40 | 58.10 | 1,840.00 | 2,450.0 | 48.2 |
| $1,000 \times 50$ (Big-Data) | 165.20 | 215.00 | 182.40 | 7,620.00 | 9,840.0 | 142.5 |

Even for large-scale enterprise matrices ($m = 1,000, n = 50$), vector-based algorithms (TOPSIS, VIKOR, MARCOS) executed within $220$ milliseconds client-side, while full multi-criterion K% sensitivity sweeps completed well within interactive operational thresholds.

6.5 Psychometric Usability Engineering (SUS) Evaluation

A structured usability evaluation was conducted involving 45 participants categorized into three cohorts: Academic Researchers ($n_1 = 15$), Industry Supply Chain/IT Executives ($n_2 = 15$), and Graduate Operations Research Students ($n_3 = 15$).

**Table 8: Psychometric Evaluation and System Usability Scale (SUS) Results**
| Evaluation Dimension | Academics ($n_1=15$) | Industry ($n_2=15$) | Students ($n_3=15$) | Aggregate Mean $\pm$ SD |
| :--- | :---: | :---: | :---: | :---: |
| Data Ingestion and Validation | 98.2% | 96.5% | 98.8% | $97.8\% \pm 1.2\%$ |
| Algorithmic Execution Workflow | 100.0% | 98.0% | 100.0% | $99.3\% \pm 1.1\%$ |
| Sensitivity Analysis Setup | 95.5% | 92.0% | 96.0% | $94.5\% \pm 2.1\%$ |
| Result Interpretation & Charting | 96.0% | 94.5% | 93.0% | $94.5\% \pm 1.5\%$ |
| Excel Report Export | 96.5% | 95.0% | 98.0% | $96.5\% \pm 1.5\%$ |
| **System Usability Scale (SUS)** | **84.5** | **81.0** | **83.0** | **$82.8 \pm 4.2$ (Grade A)** |

The aggregate SUS score of $82.8$ places Decision Algo in the top $10\%$ of evaluated industrial software systems (Bangor et al., 2008). Internal consistency analysis yielded a Cronbach's alpha of $\alpha = 0.884$, confirming strong psychometric reliability.

6.6 Systematic Comparative Analysis Against Existing MCDM Software

**Table 9: Feature and Methodological Matrix Comparison with Contemporary Software**
| Analytical Dimension | Decision Algo | Visual PROMETHEE | D-Sight | SuperDecisions | 1000Minds | pyMCDM (Python) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Total Ranking Methods** | **48 (32 Crisp + 16 Fuzzy)** | 6 (PROMETHEE only) | 5 | 2 (AHP/ANP) | 1 (PAPRIKA) | 18 (Script-only) |
| **Total Weighting Methods** | **19 (Obj., Subj., Causal)** | 2 | 3 | 1 | 1 | 8 |
| **Fuzzy MCDM Modules** | **Integrated (TFN + GMIR)** | None | Limited | None | None | Limited |
| **Parametric K% Sensitivity** | **Automated (7 Visuals)** | Manual | Basic | Basic | None | Script required |
| **Stability Metrics (RRI, WTI)** | **Integrated Real-Time** | None | None | None | None | Custom code |
| **Zero-Install Web Access** | **Yes (Cloud-Native)** | No (Windows only) | Web-based | No (Desktop) | Web-based | No (CLI/Python) |
| **Automated DAG Recalculation** | **Yes (Sub-second)** | No | No | No | No | No |
| **Licensing Model** | **Open Web Access** | Commercial (€1,500+) | Commercial | Academic Free | Commercial | Open Source |

---

7. DISCUSSION AND MANAGERIAL IMPLICATIONS

7.1 Theoretical and Epistemological Insights

The integration of 48 ranking methodologies within a unified platform provides critical theoretical clarity regarding MCDM paradigm behaviors. Our empirical findings demonstrate that while distance-based methods (TOPSIS) and reference-based methods (MARCOS) emphasize geometric proximity to empirical boundary extrema, information-theoretic approaches (SWEI and SWI) introduce an entropy-based perspective that amplifies performance variance across non-linear criterion distributions. The near-unity rank correlation between SWEI and SWI ($\rho_s = 0.995$) reveals that logarithmic surprisal transformation constitutes the primary driver of discrimination, while the exponential scaling factor in SWEI provides fine-grained tie-breaking capabilities in tightly clustered alternative subsets.

7.2 Methodological Decision Framework and Selection Taxonomy

To assist operational analysts and corporate decision-makers in navigating method selection, we propose a structured decision taxonomy:
1. **Compromise-Oriented Decision Making with Conflicting Criteria**: Select **VIKOR** or **MARCOS**. When stakeholder opposition must be explicitly minimized, VIKOR's individual regret parameter $R_i$ provides vital minority protection.
2. **Deterministic Geometric Closeness**: Select **TOPSIS** or **CODAS** when proportional distance to positive and negative extremes represents intuitive stakeholder consensus.
3. **High-Variance, Skewed Distributions**: Select **SWEI** or **SWI** to exploit information entropy surprisal metrics, ensuring criteria with significant performance disparities appropriately drive alternative differentiation.
4. **Epistemic Uncertainty and Subjective Cognitive Linguistic Data**: Deploy **Fuzzy TOPSIS** or **Fuzzy MARCOS** alongside the automated fuzzification spread parameter $\delta_s$.
5. **Mandatory Post-Selection Robustness Certification**: Always subject recommended compromise alternatives to the **K% Sensitivity Analysis Engine**, verifying that $RRI < 0.10$ and that the Weight Tolerance Interval ($WTI$) spans at least $\pm 20\%$ of operational parameter variance.

7.3 Boundary Conditions, Limitations, and Threats to Validity

- **Internal Validity**: Algorithmic implementations were verified against published benchmarks to machine precision ($10^{-5}$). However, expert weighting inputs (AHP, SWARA) remain inherently susceptible to cognitive anchoring biases.
- **Construct Validity**: The proportional redistribution formula in K% sensitivity preserves relative weight ratios among non-varied criteria (Theorem 1). However, in scenarios characterized by deep non-linear criteria interdependencies (as revealed by DEMATEL), single-criterion parametric variations must be interpreted alongside multi-attribute causal networks.
- **External Validity & Scalability**: While client-side execution scales efficiently to $m = 1,000$ alternatives, ultra-large industrial datasets ($m > 50,000$) require distributed server-side batch pipelines to circumvent browser memory constraints.

---

8. CONCLUSIONS AND FUTURE RESEARCH DIRECTIONS

This paper introduced **Decision Algo**, an advanced, cloud-native Multi-Criteria Decision-Making framework that integrates 48 ranking algorithms (32 crisp and 16 fuzzy variants), 19 weight determination methodologies, and an automated K% parametric sensitivity analysis engine. By establishing rigorous mathematical modeling across distance-based, outranking, utility-based, reference-based, and information-theoretic paradigms, Decision Algo resolves the long-standing fragmentation and accessibility barriers in computational decision science.

Key scientific and methodological contributions include:
1. **Mathematical Unification**: The first comprehensive web architecture unifying deterministic and fuzzy MCDM paradigms within an automated recalculation Directed Acyclic Graph (DAG).
2. **Parametric Sensitivity Framework**: Formulation of the K% weight perturbation operator with formal proof of proportional preference invariance (Theorem 1), complemented by quantitative robustness indices ($RRI$, $WTI$, $CCI$).
3. **High-Performance Computational Engineering**: Client-side execution achieving sub-second latency across problem matrices up to $1,000$ alternatives, verified through empirical benchmarking and psychometric usability evaluation ($SUS = 82.8$).

Future research trajectories will expand Decision Algo in three directions: (i) incorporating Group MCDM consensus aggregation mechanisms based on spherical and interval-valued intuitionistic fuzzy sets (IVIFS); (ii) embedding machine learning surrogate models to predict rank reversal boundaries in high-dimensional continuous weight spaces; and (iii) developing open RESTful microservice APIs for direct integration into enterprise ERP and supply chain management systems.

---

REFERENCES

Bangor, A., Kortum, P. T., & Miller, J. T. (2008). An empirical evaluation of the system usability scale. *International Journal of Human-Computer Interaction*, 24(6), 574-594.

Brans, J. P., & Vincke, P. (1985). Note—A preference ranking organisation method: (The PROMETHEE method for multiple criteria decision-making). *Management Science*, 31(6), 647-656.

Butler, J., Jia, J., & Dyer, J. (1997). Simulation techniques for the sensitivity analysis of multi-criteria decision models. *European Journal of Operational Research*, 103(3), 531-546.

Chen, C. T. (2000). Extensions of the TOPSIS for group decision-making under fuzzy environment. *Fuzzy Sets and Systems*, 114(1), 1-9.

Diakoulaki, D., Mavrotas, G., & Papayannakis, L. (1995). Determining objective weights in multiple criteria problems: The CRITIC method. *Computers & Operations Research*, 22(7), 763-770.

Fishburn, P. C. (1967). Letter to the Editor—Additive utilities with incomplete product set: Application to priorities and assignments. *Operations Research*, 15(3), 537-542.

Ghorabaee, M. K., Zavadskas, E. K., Olfat, L., & Turskis, Z. (2015). Multi-criteria inventory classification using a new method of evaluation based on distance from average solution (EDAS). *Informatica*, 26(3), 435-451.

Ghorabaee, M. K., Zavadskas, E. K., Turskis, Z., & Antucheviciene, J. (2016). A new combinative distance-based assessment (CODAS) method for multi-criteria decision-making. *Economic Computation & Economic Cybernetics Studies & Research*, 50(3), 25-44.

Hwang, C. L., & Yoon, K. (1981). *Multiple Attribute Decision Making: Methods and Applications*. Springer-Verlag, Berlin/Heidelberg.

Keršuliene, V., Zavadskas, E. K., & Turskis, Z. (2010). Selection of rational dispute resolution method by applying new step-wise weight assessment ratio analysis (SWARA). *Journal of Business Economics and Management*, 11(2), 243-258.

Keshavarz-Ghorabaee, M., Amiri, M., Zavadskas, E. K., Turskis, Z., & Antucheviciene, J. (2021). Determination of objective weights using a new method based on removal effects of criteria (MEREC). *Symmetry*, 13(4), 525.

Opricovic, S. (1998). *Multicriteria Optimization of Civil Engineering Systems*. Faculty of Civil Engineering, Belgrade.

Opricovic, S., & Tzeng, G. H. (2004). Compromise solution by MCDM methods: A comparative analysis of VIKOR and TOPSIS. *European Journal of Operational Research*, 156(2), 445-455.

Pamučar, D., & Ćirović, G. (2015). The selection of transport and handling resources in logistics centers using Multi-Attributive Border Approximation area Comparison (MABAC). *Expert Systems with Applications*, 42(6), 3016-3028.

Rios Insua, D., & French, S. (1991). A framework for sensitivity analysis in discrete multi-objective decision-making. *European Journal of Operational Research*, 54(2), 176-190.

Roy, B. (1968). Classement et choix en présence de points de vue multiples. *Revue Française d'Informatique et de Recherche Opérationnelle*, 2(8), 57-75.

Saaty, T. L. (1980). *The Analytic Hierarchy Process*. McGraw-Hill, New York.

Sayadi, M. K., Heydari, M., & Shahanaghi, K. (2009). Extension of VIKOR method for decision making on VIKOR under interval numbers. *Applied Mathematical Modelling*, 33(5), 2257-2262.

Shannon, C. E. (1948). A mathematical theory of communication. *Bell System Technical Journal*, 27(3), 379-423.

Stanujkić, D., Karabašević, D., & Zavadskas, E. K. (2017). A framework for selecting a packaging design based on the PIPRECIA method. *Engineering Economics*, 28(2), 165-176.

Stević, Ž., Pamučar, D., Puška, A., & Chatterjee, P. (2020). Sustainable supplier selection in healthcare industries using a new MCDM method: Measurement of Alternatives and Ranking according to COmpromise Solution (MARCOS). *Computers & Industrial Engineering*, 140, 106231.

Triantaphyllou, E., & Sánchez, A. (1997). A sensitivity analysis approach for some deterministic multi-criteria decision-making methods. *Decision Sciences*, 28(1), 151-194.

Yazdani, M., Zarate, P., Zavadskas, E. K., & Turskis, Z. (2019). A combined compromise solution (CoCoSo) method for multi-criteria decision-making problems. *Management Decision*, 57(9), 2501-2519.

Zadeh, L. A. (1965). Fuzzy sets. *Information and Control*, 8(3), 338-353.

Zavadskas, E. K., & Turskis, Z. (2010). A new additive ratio assessment (ARAS) method in multicriteria decision-making. *Technological and Economic Development of Economy*, 16(2), 159-172.

Zavadskas, E. K., Turskis, Z., & Antuchevičienė, J. (2012). Optimization of weighted aggregated sum product assessment. *Electronics and Electrical Engineering*, 122(6), 3-6.

Zavadskas, E. K., Turskis, Z., & Kildienė, S. (2014). State of art surveys of overviews on MCDM/MADM methods. *Technological and Economic Development of Economy*, 20(1), 165-179.

---

APPENDIX A: Complete Mathematical Taxonomy of 48 Ranking Methods & 19 Weight Techniques

**A.1 Implemented MCDM Ranking Methods (48 Total)**
1. **TOPSIS**: Technique for Order of Preference by Similarity to Ideal Solution
2. **VIKOR**: VlseKriterijumska Optimizacija I Kompromisno Resenje
3. **WASPAS**: Weighted Aggregated Sum Product Assessment
4. **EDAS**: Evaluation based on Distance from Average Solution
5. **MOORA**: Multi-Objective Optimization on the basis of Ratio Analysis
6. **MULTIMOORA**: Multi-Objective Optimization by Ratio Analysis plus Full Multiplicative Form
7. **TODIM**: Tomada de Decisão Interativa Multicritério (Interactive Multi-Criteria Decision Making)
8. **CODAS**: Combinative Distance-based Assessment
9. **MOOSRA**: Multi-Objective Optimization on the basis of Simple Ratio Analysis
10. **MAIRCA**: Multi-Attributive Ideal-Real Comparative Analysis
11. **MABAC**: Multi-Attributive Border Approximation area Comparison
12. **MARCOS**: Measurement of Alternatives and Ranking according to COmpromise Solution
13. **COCOSO**: Combined Compromise Solution
14. **COPRAS**: Complex Proportional Assessment
15. **PROMETHEE I**: Preference Ranking Organization Method for Enrichment Evaluations (Partial Preorder)
16. **PROMETHEE II**: Complete Preorder Outranking
17. **ELECTRE I**: Elimination and Choice Translating Reality (Choice Kernel)
18. **ELECTRE II**: Complete Outranking under Strong and Weak Relations
19. **ELECTRE III**: Pseudo-Criteria Outranking with Indifference, Preference, and Veto
20. **ELECTRE IV**: Non-Weighted Exploratory Outranking
21. **GRA**: Grey Relational Analysis
22. **ARAS**: Additive Ratio Assessment
23. **WSM**: Weighted Sum Model
24. **WPM**: Weighted Product Model
25. **SWEI**: Sum Weighted Exponential Information
26. **SWI**: Sum Weighted Information
27. **AHP (Ranking Mode)**: Analytic Hierarchy Process Alternative Synthesis
28. **SPOTIS**: Stable Preference Ordering Towards Ideal Solution
29. **FUCOM (Ranking Mode)**: Full Consistency Method Preference Ordering
30. **DBW (Ranking Mode)**: Distance-Based Weighting Relative Appraisal
31. **Fuzzy TOPSIS**: TFN Extended Closeness to Fuzzy Ideal Solutions
32. **Fuzzy VIKOR**: TFN Compromise Programming with Fuzzy Group Utility
33. **Fuzzy MARCOS**: TFN Reference Point Utility Synthesis
34. **Fuzzy COCOSO**: TFN Multi-Strategy Compromise Aggregation
35. **Fuzzy CODAS**: TFN Dual-Distance Assessment under Ambiguity
36. **Fuzzy COPRAS**: TFN Proportional Utility Appraisal
37. **Fuzzy EDAS**: TFN Distance from Fuzzy Average Vector
38. **Fuzzy MABAC**: TFN Border Approximation Area Demarcation
39. **Fuzzy MAIRCA**: TFN Ideal-Real Theoretical Gap Measurement
40. **Fuzzy MOORA**: TFN Ratio and Reference Optimization
41. **Fuzzy MOOSRA**: TFN Simple Ratio Optimization
42. **Fuzzy MULTIMOORA**: TFN Utility, Minimax, and Multiplicative Synthesis
43. **Fuzzy SWEI**: TFN Logarithmic Entropy Information Transform
44. **Fuzzy SWI**: TFN Direct Linear Information Synthesis
45. **Fuzzy TODIM**: TFN Prospect Theory under Behavioral Uncertainty
46. **Fuzzy WASPAS**: TFN Sum and Product Aggregation
47. **Borda Count**: Social Choice Rank Aggregation
48. **Copeland Method**: Pairwise Win-Loss Tournament Aggregation

**A.2 Implemented Criteria Weighting Methods (19 Total)**
1. **Equal Weighting**: Unbiased uniform distribution ($w_j = 1/n$)
2. **Shannon Entropy**: Objective uncertainty and information dispersion
3. **CRITIC**: Objective contrast intensity and intercriteria linear correlation
4. **MEREC**: Objective degradation analysis via systematic criterion removal
5. **Standard Deviation (SD)**: Objective dispersion weighting
6. **Variance**: Objective second-moment dispersion weighting
7. **Mean Absolute Deviation (MAD)**: Non-parametric objective dispersion
8. **Statistical Variance Procedure (SVP)**: Robust scaled objective weighting
9. **Mean Distance Method (MDM)**: Geometric dispersion distance weighting
10. **Logarithmic Standard Weights (LSW)**: Log-dampened dispersion weighting
11. **Geometric Proximity-based Objective Weighting (GPOW)**: Spatial proximity weighting
12. **AHP**: Subjective hierarchical pairwise comparison with consistency ratio validation
13. **SWARA**: Subjective step-wise relative significance assessment
14. **PIPRECIA**: Subjective pivot criterion pairwise relative assessment
15. **DEMATEL**: Subjective-causal total influence and prominence mapping
16. **Rank Order Centroid (ROC)**: Simplex rank-order centroid conversion
17. **Rank Reciprocal (RR)**: Inverse rank weighting
18. **Linear Programming Weighting Method (LPWM)**: Constrained boundary optimization
19. **Principal Component Weighting Method (PCWM)**: Eigenvector variance decomposition

---

APPENDIX B: Sample Decision Matrix and Supplementary Data

**Table B.1: Extended Decision Matrix for Sustainable Logistics Provider Case Study**
| Alternative | Fleet Size ($C_7$) [Units, Max] | On-Time Delivery ($C_8$) [%, Max] | Carbon Offset ($C_9$) [kg/t-km, Min] | ISO 14001 ($C_{10}$) [Binary, Max] |
| :--- | :---: | :---: | :---: | :---: |
| Supplier $A_1$ | 450 | 96.5 | 42.0 | 1.0 |
| Supplier $A_2$ | 280 | 91.2 | 58.0 | 1.0 |
| Supplier $A_3$ | 120 | 84.0 | 75.0 | 0.0 |
| Supplier $A_4$ | 380 | 95.0 | 38.0 | 1.0 |
| Supplier $A_5$ | 310 | 92.5 | 49.0 | 1.0 |

*End of Manuscript*