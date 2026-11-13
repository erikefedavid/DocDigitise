"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowRight, CheckCircle2, TrendingDown, Users, Clock, DollarSign } from "lucide-react";
import Link from "next/link";

export function ClearanceRoiCalculator() {
  const [studentCohort, setStudentCohort] = useState(2500);
  const [manualMinutesPerDoc, setManualMinutesPerDoc] = useState(18);
  const [hourlyWage, setHourlyWage] = useState(12);

  // Clearance calculation metrics
  // Average clearance requires 4 core documents (Bursary receipt, Library clearance, Faculty signoff, Dept dues)
  const docsPerStudent = 4;
  const totalDocuments = studentCohort * docsPerStudent;

  // Manual Clearance Costs & Time
  const manualTotalHours = Math.round((totalDocuments * manualMinutesPerDoc) / 60);
  const manualTotalCost = Math.round(manualTotalHours * hourlyWage);

  // DocDigitize Automated Clearance (Groq Vision OCR + Autonomous Agent Audit in <12 seconds/doc)
  const automatedMinutesPerDoc = 0.2; // 12 seconds
  const automatedTotalHours = Math.round((totalDocuments * automatedMinutesPerDoc) / 60);
  const automatedCostEstimate = Math.round(studentCohort * 0.45); // $0.45 platform processing fee per student

  // Net Savings
  const hoursSaved = manualTotalHours - automatedTotalHours;
  const costSavings = Math.max(0, manualTotalCost - automatedCostEstimate);
  const efficiencyGain = Math.round((manualMinutesPerDoc / automatedMinutesPerDoc));

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
          <Calculator className="h-3.5 w-3.5" />
          Institutional ROI Model
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Clearance Automation & Efficiency Impact
        </h2>
        <p className="text-muted-foreground mt-3 text-base sm:text-lg">
          Estimate administrative labor hours, backlog reduction, and annual budget savings when transitioning from physical queues to autonomous digital audit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <Card className="lg:col-span-5 border-2 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between text-sm font-medium mb-2">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Graduating Cohort Size
                </span>
                <span className="font-mono font-semibold text-primary">
                  {studentCohort.toLocaleString()} students
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="15000"
                step="250"
                value={studentCohort}
                onChange={(e) => setStudentCohort(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1 font-mono">
                <span>500</span>
                <span>7,500</span>
                <span>15,000</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm font-medium mb-2">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Manual Review per Record
                </span>
                <span className="font-mono font-semibold text-primary">
                  {manualMinutesPerDoc} minutes
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                step="1"
                value={manualMinutesPerDoc}
                onChange={(e) => setManualMinutesPerDoc(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1 font-mono">
                <span>5 min (fast)</span>
                <span>20 min (avg)</span>
                <span>45 min (complex)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm font-medium mb-2">
                <span className="flex items-center gap-1.5 text-foreground">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Staff Hourly Cost / Wage
                </span>
                <span className="font-mono font-semibold text-primary">
                  ${hourlyWage}/hr
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={hourlyWage}
                onChange={(e) => setHourlyWage(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1 font-mono">
                <span>$5/hr</span>
                <span>$20/hr</span>
                <span>$40/hr</span>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Includes 4 core documents per student clearance file.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Deterministic autonomous audit validation in &lt;12s.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic ROI Metrics Output */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Staff Hours Saved
                  </span>
                  <TrendingDown className="h-4 w-4 text-primary" />
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-foreground">
                  {hoursSaved.toLocaleString()}
                  <span className="text-base font-normal text-muted-foreground ml-1">hrs</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Reduced from {manualTotalHours.toLocaleString()} manual review hours to {automatedTotalHours} automated verification hours.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Projected Net Savings
                  </span>
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ${costSavings.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Direct operational expenditure reduction during peak clearance cycles.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2">
            <CardContent className="p-6">
              <h3 className="text-base font-semibold mb-3 flex items-center justify-between">
                <span>Operational Velocity Multiplier</span>
                <span className="font-mono text-primary font-bold text-lg">{efficiencyGain}x Faster</span>
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                By eliminating physical queues, paper dossier loss, and manual stamps, academic registrars can conduct instantaneous autonomous clearance verification while preserving compliance audit trails.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto font-medium">
                    Deploy Pilot for University
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <a
                  href="https://github.com/erikefedavid/DocDigitise"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button variant="outline" className="w-full sm:w-auto font-medium">
                    View Architecture on GitHub
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
