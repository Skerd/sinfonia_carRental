import {describe, expect, it} from "vitest";
import {withAccountContact} from "../accountContact.ts";

const empty = {firstName: "", lastName: "", email: "", phone: ""};
const account = {id: "u1", name: "Ada", surname: "Lovelace", email: "ada@example.com", username: "ada@example.com", phoneNumber: "+355 69 000 0000"};

describe("the booking contact of a signed-in customer (TD-F156)", () => {
    it("fills the empty fields from the account", () => {
        expect(withAccountContact(empty, account)).toEqual({firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", phone: "+355 69 000 0000"});
    });

    it("keeps what was typed", () => {
        expect(withAccountContact({...empty, firstName: "Augusta"}, account).firstName).toBe("Augusta");
    });

    it("leaves the block as it is when nobody is signed in", () => {
        expect(withAccountContact(empty, {...account, id: ""})).toBe(empty);
    });
});
