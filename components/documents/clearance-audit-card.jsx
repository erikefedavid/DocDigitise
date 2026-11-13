"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, RefreshCw, Loader2, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function ClearanceAuditCard({ documentId, initialAudit = null }) {
  const [audit, setAudit] = useState(initialAudit);
  const [loading, setLoading] = useState(!initialAudit);
  const [isReauditing, setIsReauditing] = useState(false);

  const fetchAudit = async (forceReaudit = false) => {
    if (forceReaudit) setIsReauditing(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/documents/${documentId}/audit`, {
        method: forceReaudit ? "POST" : "GET",
      });
      const data = await res.json();

      if (data.success && data.data?.audit) {
        setAudit(data.data.audit);
        if (forceReaudit) toast.success("Compliance audit refreshed!");
      } else {
        toast.error("Could not run compliance audit on this document.");
      }
    } catch (err) {
      toast.error("Failed to fetch compliance audit.");
    } finally {
      setLoading(false);
      setIsReauditing(false);
    }
  };

  if (loading) {
    return (
      <Card className="border border-border/50 bg-card/60">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Running autonomous compliance audit...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!audit || audit.overallStatus === "NOT_CLEARANCE_DOCUMENT") {
    return null; // Don't show clearance card on general documents (e.g. random articles/notes)
  }

  const isApproved = audit.overallStatus === "APPROVED";

  return (
    <Card className={`border transition-all ${
      isApproved 
        ? "border-emerald-500/30 bg-emerald-500/[0.02]" 
        : "border-amber-500/30 bg-amber-500/[0.02]"
    }`}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2.5">
          {isApproved ? (
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-amber-500" />
          )}
          <div>
            <CardTitle className="text-base font-semibold">Institutional Clearance Audit</CardTitle>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">Autonomous Verification Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isApproved ? "default" : "destructive"} className={isApproved ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
            {audit.overallStatus.replace(/_/g, " ")}
          </Badge>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchAudit(true)}
            disabled={isReauditing}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isReauditing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Student Metadata Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-muted/40 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Candidate</span>
            <span className="font-semibold text-foreground">{audit.student?.fullName || "Unspecified"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Matriculation</span>
            <span className="font-mono text-foreground">{audit.student?.matricNumber || "Missing"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Department</span>
            <span className="text-foreground">{audit.student?.department || "General"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Ledger Status</span>
            <span className={`font-mono font-bold ${audit.financialAudit?.isCleared ? "text-emerald-500" : "text-rose-500"}`}>
              {audit.financialAudit?.isCleared ? "CLEARED" : `UNPAID (${audit.financialAudit?.currency || "NGN"} ${audit.financialAudit?.outstandingBalance || 0})`}
            </span>
          </div>
        </div>

        {/* Departmental Sign-off Matrix */}
        {audit.departmentalSignoffs && audit.departmentalSignoffs.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Departmental Sign-off Checklist
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {audit.departmentalSignoffs.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/40 text-xs"
                >
                  <div className="flex items-center gap-2">
                    {item.signoffPresent ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    )}
                    <span className="font-medium text-foreground">{item.department}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${item.signoffPresent ? "text-emerald-500" : "text-rose-500"}`}>
                    {item.signoffPresent ? "VERIFIED" : "PENDING"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deficiencies Callout if any */}
        {audit.deficiencyReasons && audit.deficiencyReasons.length > 0 && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 space-y-1">
            <span className="font-semibold block">Audit Deficiencies:</span>
            {audit.deficiencyReasons.map((reason, idx) => (
              <p key={idx}>• {reason}</p>
            ))}
          </div>
        )}

        {/* Summary note */}
        {audit.summary && (
          <p className="text-xs text-muted-foreground italic pt-1">
            &quot;{audit.summary}&quot;
          </p>
        )}
      </CardContent>
    </Card>
  );
}
