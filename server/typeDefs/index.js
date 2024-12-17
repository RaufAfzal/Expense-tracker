import { mergeTypeDefs } from "@graphql-tools/merge";
import userTypeDef from "./user.typeDef.js";
import transactionTypeDef from "./transcation.typeDef.js";


const mergeTypeDefs = mergeTypeDefs([userTypeDef, transactionTypeDef]);

export default mergeTypeDefs