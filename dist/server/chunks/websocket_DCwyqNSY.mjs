import { WebSocket } from "ws";
//#region src/lib/websocket.ts
var clients = /* @__PURE__ */ new Set();
function broadcastEvent(type, data) {
	const message = JSON.stringify({
		type,
		data,
		timestamp: (/* @__PURE__ */ new Date()).toISOString()
	});
	for (const client of clients) if (client.readyState === WebSocket.OPEN) try {
		client.send(message);
	} catch (err) {}
}
//#endregion
export { broadcastEvent as t };
