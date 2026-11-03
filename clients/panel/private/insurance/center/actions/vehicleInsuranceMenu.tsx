import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {useNavigate} from "react-router-dom";
import {IconArrowBackUp, IconRefresh, IconX} from "@tabler/icons-react";
import type {VehicleInsurance} from "armonia/src/modules/carRental/api/carRental/private/vehicleInsurance/vehicleInsurance.dto.ts";
import {vehicleScopeLabel} from "@carRentalModule/clients/panel/vehicleScope.ts";

export type VehicleInsuranceAction = "cancel" | "uncancel";

type Props = WithLanguageType & {policy: VehicleInsurance; onAction: (action: VehicleInsuranceAction) => void};

/** The create form filled from this policy (same car, insurer and cover), naming it as the one renewed. */
export function vehicleInsuranceRenewPath(policy: VehicleInsurance): string {
    const params = new URLSearchParams({renews: policy._id, insurer: policy.insurer, coverage: policy.coverage});
    if (policy.vehicle) {
        params.set("vehicleId", policy.vehicle._id);
        params.set("vehicleName", vehicleScopeLabel(policy.vehicle));
    }
    return `/carRental/insurance/create?${params.toString()}`;
}

/** Renew a policy not renewed yet; cancel an open one, or restore a cancelled one. Status is not a form field. */
function VehicleInsuranceMenu({policy, onAction, resolveLanguageKey}: Props) {
    const {write, create} = useAccess("vehicleinsurances");
    const navigate = useNavigate();
    if (policy.deletedAt) return null;
    const open = (action: VehicleInsuranceAction) => (e: {preventDefault(): void; stopPropagation(): void}) => {
        e.preventDefault();
        e.stopPropagation();
        onAction(action);
    };
    const canRenew = create && policy.status !== "cancelled" && !policy.supersededBy;
    return (
        <>
            {canRenew && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(vehicleInsuranceRenewPath(policy)); }}>
                    <IconRefresh size={16} />
                    <p>{resolveLanguageKey("renew")}</p>
                </DropdownMenuItem>
            )}
            {write?.status && policy.status === "cancelled" && (
                <DropdownMenuItem onClick={open("uncancel")}>
                    <IconArrowBackUp size={16} />
                    <p>{resolveLanguageKey("uncancel")}</p>
                </DropdownMenuItem>
            )}
            {write?.status && (policy.status === "active" || policy.status === "expired") && (
                <DropdownMenuItem onClick={open("cancel")}>
                    <IconX size={16} className="text-destructive" />
                    <p className="text-destructive">{resolveLanguageKey("cancel")}</p>
                </DropdownMenuItem>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/insurance/center/actions/vehicleInsuranceMenu.tsx"),
    withDebug(true, true, "vehicleinsurances"),
)(VehicleInsuranceMenu);
