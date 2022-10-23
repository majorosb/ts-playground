import { faker } from "@faker-js/faker";
import { sample } from "lodash";

export function generate_hu_phoneNumber() {
    const prefixes = ["06", "+36"];
    const providers = ["20", "30", "70"];
    const suffix = faker.phone.number("### ####");
    const hu_phoneNumber = `${sample(prefixes)!} ${sample(providers)!} ${suffix}`;
    return hu_phoneNumber;
};
export function generate_en_address() { return `${faker.address.zipCode("####")}, ${faker.address.city()}, ${faker.address.street()} ${faker.datatype.number({ max: 90 })}`; };
export function generate_en_workshopName() { return faker.address.street(); };
export function generate_en_contactEmail() { return faker.internet.email(); };
export function generate_en_contactPerson() { return faker.name.fullName(); };
export function generate_en_customerName() { return faker.company.name(); };
export function generate_hu_licensePlateOfCustomerVehicle() { return `${faker.random.alpha({ count: 3, casing: "upper", bannedChars: ["A", "B", "C", "D", "E", "F"], })}-${faker.datatype.number({ min: 100, max: 999 })}`; };
export function generate_hu_licensePlateOfDeliveryVehicle() { return `${faker.random.alpha({ count: 3, casing: "upper", })}-${faker.datatype.number({ min: 100, max: 999 })}`; };