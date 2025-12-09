import React, { useMemo } from "react";
import { TransactionAction } from "@/components/checkout/types/checkout";
import InstructionCodeBlock from "./instructions/InstructionCodeBlock";
import InstructionQRCode from "./instructions/InstructionQRCode";
import InstructionRedirectButton from "./instructions/InstructionRedirectButton";
import StructuredInstructions from "./instructions/StructuredInstructions";
import { usePaymentInstructionConfig } from "./instructions/usePaymentInstructionConfig";
import { resolveInstructions } from "./instructions/resolveInstructions";

interface Props {
  actions?: TransactionAction[];
  channelCode?: string; // e.g. BCA_VIRTUAL_ACCOUNT, OVO, QRIS, etc
}

const PaymentInstructions: React.FC<Props> = ({ actions = [], channelCode }) => {
  const { config } = usePaymentInstructionConfig();

  const va = actions.find(
    (a) => a.type === "PRESENT_TO_CUSTOMER" && a.descriptor === "VIRTUAL_ACCOUNT_NUMBER"
  );

  const pc = actions.find(
    (a) => a.type === "PRESENT_TO_CUSTOMER" && a.descriptor === "PAYMENT_CODE"
  );

  const qr = actions.find(
    (a) => a.type === "PRESENT_TO_CUSTOMER" && a.descriptor === "QR_STRING"
  );

  const rd = actions.find(
    (a) =>
      (a.type === "REDIRECT_CUSTOMER" || a.type === "REDIRECT") &&
      (a.descriptor === "WEB_URL" || a.descriptor === "DEEPLINK_URL")
  );

  const resolved = useMemo(
    () => resolveInstructions(config, channelCode, actions),
    [config, channelCode, actions]
  );

  return (
    <div className="space-y-6">
      {(va || pc) && (
        <InstructionCodeBlock
          label={va ? "Virtual Account Number" : "Payment Code"}
          value={(va || pc)!.value ?? ""}
        />
      )}

      {qr && <InstructionQRCode value={qr.value ?? ""} />}

      {rd && <InstructionRedirectButton url={rd.value ?? ""} kind={rd.descriptor ?? ""} />}

      {channelCode && resolved && (
        <StructuredInstructions
          title={resolved.title}
          sections={resolved.sections}
          tips={config?.common_tips}
          notes={resolved.notes}
        />
      )}
    </div>
  );
};

export default PaymentInstructions;
