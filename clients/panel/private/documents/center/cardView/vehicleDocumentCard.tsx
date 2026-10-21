import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarDue, IconFileCertificate, IconHash, IconStatusChange} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {VehicleDocument} from "armonia/src/modules/carRental/api/carRental/private/vehicleDocument/vehicleDocument.dto.ts";
import VehicleDocumentSheetView from "@carRentalModule/clients/panel/private/documents/center/sheetView/vehicleDocumentSheetView.tsx";
import {vehicleDocumentEditPath} from "@carRentalModule/clients/panel/private/documents/index.tsx";

type VehicleDocumentCardProps = WithLanguageType & {
    vehicleDocument: VehicleDocument;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: VehicleDocument, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<VehicleDocument> | null>;
};

function VehicleDocumentCard({
    vehicleDocument,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: VehicleDocumentCardProps) {
    return (
        <EntityCard
            resource="vehicledocuments"
            entity={vehicleDocument}
            fetchId={fetchId}
            singleUrl="/api/carRental/vehicleDocument/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={vehicleDocumentEditPath}
            Sheet={VehicleDocumentSheetView}
            sheetEntityProp="vehicleDocument"
            deleteUrl="/api/carRental/vehicleDocument"
            restoreUrl="/api/carRental/vehicleDocument/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="vehicle"
            innerRef={innerRef}
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="vehicle" title={row.vehicle?.plate} />
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconFileCertificate}
                            label={resolveLanguageKey("type")}
                            tooltip={resolveLanguageKey("type")}
                            path="type"
                            type="enum"
                            languageKeyCategory="typeValues"
                            value={row.type}
                        />
                        <EntityCardRow
                            icon={IconHash}
                            label={resolveLanguageKey("documentNumber")}
                            tooltip={resolveLanguageKey("documentNumber")}
                            path="documentNumber"
                            value={row.documentNumber}
                        />
                        <EntityCardRow
                            icon={IconCalendarDue}
                            label={resolveLanguageKey("expiresAt")}
                            tooltip={resolveLanguageKey("expiresAt")}
                            path="expiresAt"
                            type="date"
                            value={row.expiresAt}
                        />
                        <EntityCardRow
                            icon={IconStatusChange}
                            label={resolveLanguageKey("status")}
                            tooltip={resolveLanguageKey("status")}
                            path="status"
                            type="enum"
                            languageKeyCategory="statusValues"
                            value={row.status}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/documents/center/cardView/vehicleDocumentCard.tsx"),
    withDebug(true, true, "vehicledocuments"),
)(VehicleDocumentCard);
