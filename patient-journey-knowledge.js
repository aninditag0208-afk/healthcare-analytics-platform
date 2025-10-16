/**
 * Patient Journey Rules Knowledge Base
 * Extracted from Patient Journey Rules.docx for AML and HER2+ Breast Cancer
 */

window.PatientJourneyKnowledge = {

    // HER2+ Breast Cancer Knowledge
    her2_breast_cancer: {
        patient_funnel_rules: [
            "Rule 1: Identify all Breast cancer patients based on ICD-9 and ICD-10 diagnosis codes",
            "Rule 2: Minimum Two Primary Diagnosis at least 15 days apart to filter out mis-diagnosed patients",
            "Rule 3: Min 1 year look back period to ensure entire journey capture from first diagnosis",
            "Rule 4: Quarterly eligibility for continuous data capture",
            "Rule 5: No treatment before diagnosis to ensure data from first diagnosis",
            "Rule 6: No metastatic claims before diagnosis",
            "Rule 7: HER2+ Patients identified based on utilization of backbone drugs"
        ],

        backbone_drugs: [
            "Trastuzumab (Herceptin + Biosimilars)", "Perjeta", "Kadcyla", "Tykerb",
            "Enhertu", "Nerlynx", "Phesgo", "Tukysa", "Margenza"
        ],

        drug_classifications: {
            "HER2_backbone": ["TRASTUZUMAB", "PERJETA", "KADCYLA", "TYKERB", "ENHERTU", "NERLYNX", "PHESGO", "TUKYSA", "MARGENZA"],
            "chemotherapy": {
                "platin_based": ["CARBOPLATIN", "CISPLATIN", "OXALIPLATIN"],
                "taxane_based": ["ABRAXANE", "PACLITAXEL", "ETOPOSIDE"],
                "other_chemos": ["ETOPOSIDE", "VINCRISTINE", "CYCLOPHOSPHAMIDE", "DOXORUBICIN", "ELLENCE", "GEMCITABINE", "METHOTREXATE", "XELODA", "NAVELBINE", "ADRUCIL", "AFINITOR", "VINBLASTINE"]
            },
            "hormonal_therapy": {
                "aromatase_inhibitors": ["ANASTROZOLE", "LETROZOLE", "TAMOXIFEN", "EXEMESTANE", "FASLODEX", "ZOLADEX", "EVISTA", "FARESTON"],
                "cdk_inhibitors": ["IBRANCE", "VERZENIO", "KISQALI"]
            },
            "targeted_other": ["HALAVEN", "AVASTIN", "WELLCOVORIN", "LEUCOVORIN", "LYNPARZA", "PIQRAY", "TRODELVY", "ZEJULA", "TALZENNA", "ZORTRESS", "RUBRACA"]
        },

        lot_progression_rules: [
            "Rule 1: Movement from one HER2+ drug to another indicates progression (Exception: Perjeta + Herceptin combination)",
            "Rule 2: Addition of lower priority drug to higher priority regimen is not line change",
            "Rule 3: Switch within Chemotherapy/targeted therapy is progression if previous regimen ≥90 days",
            "Rule 4: Movement from AI to CDK and vice versa is progression. Within AI/CDK is progression if gap ≥180 days",
            "Rule 5: Switch to HER2+ drug from other groups is progression if previous usage >90 days",
            "Rule 6: Switch to chemo indicates severity, progression if previous usage >90 days",
            "Rule 7: Targeted therapy usage is progression if previous usage >90 days",
            "Rule 8: Switch to AI mono regimens to prevent relapse is not progression",
            "Rule 9: Same regimen with gap <180 days is not progression"
        ],

        episode_creation: {
            definition: "Continuous usage of a drug where refills occur within Grace window",
            steps: [
                "Filter for relevant treatments/drugs",
                "Check gap between next fill date and current rx end date",
                "If gap < grace period: continuation of current episode",
                "If gap > grace period: new episode"
            ]
        },

        regimen_creation: {
            definition: "Combination of treatments undergone by patient in journey, derived from episodes",
            method: "Derived from episode table with episode start/end dates for every drug"
        }
    },

    // AML Knowledge
    aml: {
        patient_funnel_rules: [
            "Rule 1: AML Diagnosed Patients - at least 1 AML Primary Diagnosis claim",
            "Rule 2: Minimum Two Primary Diagnosis at least 15 days apart OR 1 Diagnosis + 1 AML treatment post initiation",
            "Rule 3: Min 1 year look back period for entire journey capture",
            "Rule 5: No Remission or Relapse diagnosis before AML diagnosis",
            "Rule 6: At least 1 AML relevant treatment post Diagnosis to filter mis-diagnosed patients"
        ],

        treatment_phases: {
            "induction": {
                description: "Initial intensive treatment phase",
                duration: "Typically ≥90 days",
                next_phases: ["consolidation", "refractory", "maintenance"]
            },
            "consolidation": {
                description: "Post-remission treatment to eliminate residual disease",
                criteria: [
                    "Gap of >60 days from induction therapy end",
                    "Induction therapy duration ≥90 days"
                ],
                duration: "Expected ~6 cycles of 4 weeks (24 weeks total)",
                next_phases: ["maintenance", "relapse"]
            },
            "maintenance": {
                description: "Long-term treatment to prevent relapse",
                criteria: [
                    "ONUREG treatment within 90 days post Consolidation end",
                    "OR 24 weeks (168 days) post Consolidation start",
                    "OR post 24 weeks post Remission Dx"
                ],
                end_criteria: "Ends at Relapse Dx",
                next_phases: ["relapse"]
            },
            "refractory": {
                description: "Disease not responding to initial treatment",
                criteria: "Switching from induction therapy within 60 days of therapy start",
                next_phases: ["relapse", "sct"]
            },
            "relapse": {
                description: "Disease recurrence after remission",
                criteria: [
                    "Switching to Salvage Drugs",
                    "2 consecutive relapse Dx between 15-45 days apart",
                    "Single relapse Dx + Salvage drugs within -15 to +30 days",
                    "Gap >180 days post consolidation/maintenance/refractory therapy"
                ],
                next_phases: ["second_relapse"]
            },
            "second_relapse": {
                criteria: [
                    "Gap >90 days post relapse stage",
                    "Switching to new regimen post Relapse therapy"
                ]
            }
        },

        salvage_drugs: [
            "Gilteritinib", "Sorafenib", "Fludarabine", "Enasidenib",
            "Ivosidenib", "Gemtuzumab Ozogamicin", "Midostaurin"
        ],

        key_transitions: {
            "induction_to_consolidation": "Gap >60 days + Induction ≥90 days",
            "consolidation_to_maintenance": "168 days (24 weeks) from consolidation start",
            "any_to_relapse": "Gap >180 days OR Salvage drugs OR 2 consecutive relapse Dx",
            "relapse_to_second_relapse": "Gap >90 days + new regimen"
        },

        sct_considerations: {
            description: "Stem Cell Transplant",
            timing: "Can occur during consolidation or refractory phases",
            impact: "May influence line progression decisions"
        }
    },

    // Helper function to get relevant knowledge based on indication and query
    getRelevantKnowledge: function(indication, queryType) {
        const knowledge = this[indication.toLowerCase().replace(/[^a-z]/g, '_')];
        if (!knowledge) return null;

        switch(queryType) {
            case 'patient_funnel':
                return knowledge.patient_funnel_rules;
            case 'drug_classifications':
                return knowledge.drug_classifications || knowledge.salvage_drugs;
            case 'progression_rules':
                return knowledge.lot_progression_rules || knowledge.treatment_phases;
            case 'treatment_phases':
                return knowledge.treatment_phases;
            case 'backbone_drugs':
                return knowledge.backbone_drugs;
            default:
                return knowledge;
        }
    },

    // Generate context for Gemini LLM
    generateLLMContext: function(indication, userQuery) {
        const knowledge = this[indication.toLowerCase().replace(/[^a-z]/g, '_')];
        if (!knowledge) return '';

        let context = `Based on validated Patient Journey Rules for ${indication}:\n\n`;

        // Add relevant sections based on user query content
        const query = userQuery.toLowerCase();

        if (query.includes('patient') || query.includes('cohort') || query.includes('inclusion')) {
            context += `Patient Funnel Rules:\n${knowledge.patient_funnel_rules?.join('\n') || 'No specific rules found'}\n\n`;
        }

        if (query.includes('drug') || query.includes('treatment') || query.includes('therapy')) {
            if (knowledge.backbone_drugs) {
                context += `HER2+ Backbone Drugs: ${knowledge.backbone_drugs.join(', ')}\n\n`;
            }
            if (knowledge.salvage_drugs) {
                context += `AML Salvage Drugs: ${knowledge.salvage_drugs.join(', ')}\n\n`;
            }
            if (knowledge.drug_classifications) {
                context += `Drug Classifications:\n${JSON.stringify(knowledge.drug_classifications, null, 2)}\n\n`;
            }
        }

        if (query.includes('line') || query.includes('progression') || query.includes('episode') || query.includes('phase')) {
            if (knowledge.lot_progression_rules) {
                context += `Line of Therapy Progression Rules:\n${knowledge.lot_progression_rules.join('\n')}\n\n`;
            }
            if (knowledge.treatment_phases) {
                context += `Treatment Phases:\n${JSON.stringify(knowledge.treatment_phases, null, 2)}\n\n`;
            }
        }

        return context;
    }
};