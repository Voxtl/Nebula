class User {
    id: string;

    constructor(id:string) {
        this.id = id;
    }

    toJson() {
        let data = {
            id: this.id
        };

        return JSON.stringify(data);
    }
}

module.exports = User;
export default User;