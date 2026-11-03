import {compose} from "redux";
import {useNavigate} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconRefresh} from "@tabler/icons-react";
import type {VehicleDocument} from "armonia/src/modules/carRental/api/carRental/private/vehicleDocument/vehicleDocument.dto.ts";
import {vehicleScopeLabel} from "@carRentalModule/clients/panel/vehicleScope.ts";

type Props = WithLanguageType & {document: VehicleDocument};

/** The create form filled from this document (same car, type and issuer), naming it as the one renewed. */
export function vehicleDocumentRenewPath(document: VehicleDocument): string {
    const params = new URLSearchParams({renews: document._id, type: document.type, issuer: document.issuer ?? ""});
    if (document.vehicle) {
        params.set("vehicleId", document.vehicle._id);
        params.set("vehicleName", vehicleScopeLabel(document.vehicle));
    }
    return `/carRental/documents/create?${params.toString()}`;
}

/** Renew a document that no other document renewed yet. */
function VehicleDocumentMenu({document, resolveLanguageKey}: Props) {
    const {create} = useAccess("vehicledocuments");
    const navigate = useNavigate();
    if (document.deletedAt || document.supersededBy || !create) return null;
    return (
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(vehicleDocumentRenewPath(document)); }}>
            <IconRefresh size={16} />
            <p>{resolveLanguageKey("renew")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/documents/center/actions/vehicleDocumentMenu.tsx"),
    withDebug(true, true, "vehicledocuments"),
)(VehicleDocumentMenu);
