import what3words, { ApiVersion, axiosTransport } from "@what3words/api";
import { PUBLIC_W3W_API } from "$env/static/public";

const transport = axiosTransport();
const w3wService = what3words(PUBLIC_W3W_API, { host: "https://api.what3words.com", apiVersion: ApiVersion.Version3 }, { transport });

export default w3wService;
