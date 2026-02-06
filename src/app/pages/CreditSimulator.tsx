import { useEffect, useState } from "react";
import { Slider } from "../components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calculator, TrendingUp, Info } from "lucide-react";
import { motion } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { recommendCredit, type CreditRecommendation } from "../services/riskApi";

export function CreditSimulator() {
  const [trustScore, setTrustScore] = useState([75]);
  const [transactionVolume, setTransactionVolume] = useState([5000000]);
  const [paymentHistory, setPaymentHistory] = useState([95]);
  const [riskFactors, setRiskFactors] = useState([2]);
  const [creditRec, setCreditRec] = useState<CreditRecommendation | null>(null);
  const [recLoading, setRecLoading] = useState(false);

  // Credit limit calculation formula
  const baseLimit = 500000;
  const trustMultiplier = trustScore[0] / 100;
  const volumeMultiplier = Math.log10(transactionVolume[0] / 1000000 + 1);
  const historyMultiplier = paymentHistory[0] / 100;
  const riskPenalty = 1 - (riskFactors[0] * 0.1);

  const calculatedLimit = Math.round(
    baseLimit * trustMultiplier * volumeMultiplier * historyMultiplier * riskPenalty
  );

  // Simple synthetic risk proxy (0..100) for policy recommendation
  const policyRiskScore = Math.max(0, Math.min(100, riskFactors[0] * 10));

  let trustImpactText = "Low trust level restricts credit extension";
  if (trustScore[0] >= 80) trustImpactText = "Excellent trust level enables higher limits";
  else if (trustScore[0] >= 60) trustImpactText = "Good trust level with standard limits";

  const riskFactorPlural = riskFactors[0] === 1 ? "" : "s";
  const riskFactorText =
    riskFactors[0] === 0
      ? "No active risk factors detected"
      : `${riskFactors[0]} risk factor${riskFactorPlural} reducing limit by ${(riskFactors[0] * 10).toFixed(0)}%`;

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setRecLoading(true);
      try {
        const rec = await recommendCredit({
          currentCreditLimit: calculatedLimit,
          trustScore: trustScore[0],
          riskScore: policyRiskScore,
        });
        if (!cancelled) setCreditRec(rec);
      } catch {
        if (!cancelled) setCreditRec(null);
      } finally {
        if (!cancelled) setRecLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [calculatedLimit, trustScore, policyRiskScore]);

  const resetToDefaults = () => {
    setTrustScore([75]);
    setTransactionVolume([5000000]);
    setPaymentHistory([95]);
    setRiskFactors([2]);
  };

  const formatCurrency = (value: number) => {
    return `₹${(value / 100000).toFixed(1)}L`;
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#003366]">
          Adaptive Credit Limit Simulator
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Interactive what-if analysis with transparent formula calculation
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Input Controls */}
        <div className="col-span-2 space-y-6">
          {/* Trust Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                Trust Score
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">
                        Current trust level based on behavioral patterns and historical performance
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold">{trustScore[0]}</span>
                <span className="text-xs text-gray-500">Out of 100</span>
              </div>
              <Slider
                value={trustScore}
                onValueChange={setTrustScore}
                min={0}
                max={100}
                step={1}
                className="[&_[role=slider]]:bg-[#003366]"
              />
            </CardContent>
          </Card>

          {/* Transaction Volume */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                Historical Transaction Volume
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">
                        Total transaction volume over the past 12 months
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold">
                  {formatCurrency(transactionVolume[0])}
                </span>
                <span className="text-xs text-gray-500">12-month total</span>
              </div>
              <Slider
                value={transactionVolume}
                onValueChange={setTransactionVolume}
                min={1000000}
                max={50000000}
                step={500000}
                className="[&_[role=slider]]:bg-[#003366]"
              />
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                Payment History Score
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">
                        Percentage of on-time payments in payment history
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold">{paymentHistory[0]}%</span>
                <span className="text-xs text-gray-500">On-time rate</span>
              </div>
              <Slider
                value={paymentHistory}
                onValueChange={setPaymentHistory}
                min={0}
                max={100}
                step={1}
                className="[&_[role=slider]]:bg-[#003366]"
              />
            </CardContent>
          </Card>

          {/* Risk Factors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                Active Risk Factors
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">
                        Number of currently flagged risk factors or alerts
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-[#C62828]">{riskFactors[0]}</span>
                <span className="text-xs text-gray-500">Active alerts</span>
              </div>
              <Slider
                value={riskFactors}
                onValueChange={setRiskFactors}
                min={0}
                max={10}
                step={1}
                className="[&_[role=slider]]:bg-[#C62828]"
              />
            </CardContent>
          </Card>

          <Button onClick={resetToDefaults} variant="outline" className="w-full">
            Reset to Defaults
          </Button>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Calculated Credit Limit */}
          <motion.div
            key={calculatedLimit}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-br from-[#003366] to-[#004080] text-white rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-5 h-5" />
              <h2 className="font-semibold">Recommended Credit Limit</h2>
            </div>
            <div className="text-4xl font-bold mt-4 mb-2">
              {formatCurrency(calculatedLimit)}
            </div>
            <p className="text-xs opacity-90">Based on current parameters</p>
          </motion.div>

          {/* Policy Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Adaptive Policy Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Action</span>
                <span className="font-semibold">
                  {recLoading ? "Calculating…" : creditRec?.action ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Policy Risk Proxy</span>
                <span className="font-mono font-semibold">{policyRiskScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Recommended Limit</span>
                <span className="font-mono font-bold text-[#003366]">
                  {creditRec ? formatCurrency(creditRec.recommendedCreditLimit) : "—"}
                </span>
              </div>
              {creditRec?.rationale?.length ? (
                <div className="pt-2 border-t text-gray-600">
                  {creditRec.rationale.join(" · ")}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Formula Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Formula Transparency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <div className="text-gray-500 mb-1">Base Limit</div>
                <div className="font-mono font-semibold">{formatCurrency(baseLimit)}</div>
              </div>
              <div className="border-t pt-3">
                <div className="text-gray-500 mb-2">Multipliers Applied:</div>
                <div className="space-y-2 pl-2">
                  <div className="flex justify-between">
                    <span>Trust Score</span>
                    <span className="font-mono">×{trustMultiplier.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volume Factor</span>
                    <span className="font-mono">×{volumeMultiplier.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment History</span>
                    <span className="font-mono">×{historyMultiplier.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Penalty</span>
                    <span className="font-mono">×{riskPenalty.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="border-t pt-3 font-semibold">
                <div className="flex justify-between">
                  <span>Final Limit</span>
                  <span className="font-mono text-[#003366]">
                    {formatCurrency(calculatedLimit)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Impact Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="p-2 bg-blue-50 rounded">
                <div className="font-medium mb-1">Trust Score Impact</div>
                <div className="text-gray-600">{trustImpactText}</div>
              </div>
              <div className="p-2 bg-green-50 rounded">
                <div className="font-medium mb-1">Volume Consideration</div>
                <div className="text-gray-600">
                  Historical volume of {formatCurrency(transactionVolume[0])} indicates{" "}
                  {transactionVolume[0] > 10000000 ? "high" : "moderate"} activity level
                </div>
              </div>
              <div className="p-2 bg-orange-50 rounded">
                <div className="font-medium mb-1">Risk Factors</div>
                <div className="text-gray-600">{riskFactorText}</div>
              </div>

              {creditRec && (
                <div className="p-2 bg-gray-50 rounded border">
                  <div className="font-medium mb-1">Adaptive Credit Control</div>
                  <div className="text-gray-600">
                    Policy suggests <span className="font-semibold">{creditRec.action}</span> based on
                    trust and risk proxy.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
