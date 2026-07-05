const { getModels } = require("../models");
const memoryStore = require("../utils/memoryStore");

/**
 * Generates a random 4-digit challenge the applicant must read aloud /
 * type back, mimicking a liveness-check prompt. This route only issues
 * the challenge - see submitKyc for the simulated verification.
 */
function generateChallenge(req, res) {
  const code = String(Math.floor(1000 + Math.random() * 9000));
  res.json({ livenessChallengeCode: code });
}

/**
 * Synthetic-identity check: standard KYC confirms a named person exists;
 * it doesn't check whether a phone number or device has already been used
 * to onboard a *different* name. Real synthetic identities are built by
 * recombining real fragments (a real phone, a different name) across
 * systems - so this looks for that recombination directly, across every
 * applicant on the platform, not just this submitter's own records. (The
 * result only affects this submission's risk decision - it never exposes
 * another applicant's details back to the caller.)
 */
async function findLinkedIdentities(applicantName, phone, deviceId) {
  if (!phone && !deviceId) return [];

  let allRecords;
  if (global.FINCOPILOT_DEMO_MODE) {
    allRecords = memoryStore.recent("kycRecords", 100000);
  } else {
    const { KycRecord } = getModels();
    const { Op } = require("sequelize");
    allRecords = await KycRecord.findAll({
      where: {
        [Op.or]: [phone ? { phone } : null, deviceId ? { deviceId } : null].filter(Boolean),
      },
    });
  }

  const otherNames = new Set();
  for (const r of allRecords) {
    const matches = (phone && r.phone === phone) || (deviceId && r.deviceId === deviceId);
    if (matches && r.applicantName && r.applicantName.toLowerCase() !== applicantName.toLowerCase()) {
      otherNames.add(r.applicantName);
    }
  }
  return Array.from(otherNames);
}

/**
 * Simulated end-to-end decision. IMPORTANT: the liveness portion is a
 * UX/workflow simulation, not a real biometric liveness or deepfake
 * classifier - production-grade liveness detection needs a certified
 * vendor SDK. The synthetic-identity linkage check, however, is a real
 * (if simplified) technique: no single check (document, liveness, device
 * integrity, identity linkage) can pass the applicant on its own.
 */
async function submitKyc(req, res) {
  try {
    const body = req.body || {};
    if (!body.applicantName) {
      return res.status(400).json({ error: "applicantName is required" });
    }

    const documentProvided = !!body.documentProvided;
    const deviceFlaggedEmulator = !!body.deviceFlaggedEmulator;
    const phone = body.phone || null;
    const deviceId = body.deviceId || null;

    const linkedNames = await findLinkedIdentities(body.applicantName, phone, deviceId);

    let livenessConfidence = 80 + Math.random() * 18;
    if (deviceFlaggedEmulator) livenessConfidence -= 45;
    if (!documentProvided) livenessConfidence -= 25;
    livenessConfidence = Math.max(0, Math.round(livenessConfidence));

    let status = "APPROVED";
    if (deviceFlaggedEmulator || livenessConfidence < 40) status = "REJECTED";
    else if (!documentProvided || livenessConfidence < 70) status = "MANUAL_REVIEW";
    if (linkedNames.length > 0) status = linkedNames.length >= 2 ? "REJECTED" : "MANUAL_REVIEW";

    const record = {
      applicantName: body.applicantName,
      phone,
      deviceId,
      documentType: body.documentType || "AADHAAR",
      documentProvided,
      livenessChallengeCode: body.livenessChallengeCode || null,
      livenessConfidence,
      deviceFlaggedEmulator,
      status,
      userId: req.user.id,
    };

    const saved = global.FINCOPILOT_DEMO_MODE
      ? memoryStore.insertKycRecord(record)
      : await getModels().KycRecord.create(record);

    const { broadcast } = require("../utils/notificationService");
    broadcast({
      type: "KYC_SUBMISSION",
      title: status === "APPROVED" ? "KYC Approved" : status === "MANUAL_REVIEW" ? "KYC Pending Review" : "KYC Rejected",
      message: `KYC for ${body.applicantName} is ${status.replace(/_/g, " ")} (Liveness: ${livenessConfidence}%, Reuse Linkage: ${linkedNames.length})`,
      severity: status === "APPROVED" ? "success" : status === "MANUAL_REVIEW" ? "info" : "critical",
    });

    res.status(201).json({
      ...(global.FINCOPILOT_DEMO_MODE ? saved : saved.get({ plain: true })),
      syntheticIdentityFlag: linkedNames.length > 0,
      linkedIdentityCount: linkedNames.length,
    });
  } catch (err) {
    console.error("[kycController] submitKyc error:", err);
    res.status(500).json({ error: "Failed to process KYC submission" });
  }
}

async function listKyc(req, res) {
  try {
    const isAdmin = req.user.role === "admin";
    const records = global.FINCOPILOT_DEMO_MODE
      ? memoryStore.recent("kycRecords", 25, isAdmin ? null : req.user.id)
      : await getModels().KycRecord.findAll({
          where: isAdmin ? {} : { userId: req.user.id },
          order: [["createdAt", "DESC"]],
          limit: 25,
        });
    res.json(records);
  } catch (err) {
    console.error("[kycController] listKyc error:", err);
    res.status(500).json({ error: "Failed to fetch KYC records" });
  }
}

module.exports = { generateChallenge, submitKyc, listKyc };
