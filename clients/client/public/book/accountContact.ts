import type {AuthUser} from "@coreModule/helpers/redux/slices/authSlice.ts";

type Contact = {firstName: string; lastName: string; email: string; phone: string};

/**
 * The booking's contact block for a signed-in customer (TD-F156): their name, email and phone fill the fields still
 * empty, so nothing typed is overwritten and every field stays editable. Signed out, the block is left as it is.
 */
export function withAccountContact<T extends Contact>(contact: T, account: Pick<AuthUser, "id" | "name" | "surname" | "email" | "username" | "phoneNumber">): T {
    if (!account.id) return contact;
    return {
        ...contact,
        firstName: contact.firstName || account.name || "",
        lastName: contact.lastName || account.surname || "",
        email: contact.email || account.email || account.username || "",
        phone: contact.phone || account.phoneNumber || "",
    };
}
