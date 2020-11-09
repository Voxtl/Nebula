export default class User {
    id: string;

    constructor(id: string) {
        this.id = id;
    }

    toJson(): string {
        const data = {
            id: this.id
        };

        return JSON.stringify(data);
    }
}