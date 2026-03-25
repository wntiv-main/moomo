import type { M2WMessage } from "../protocol";
import type { MockJsWebSocket } from "./matplotlib";

export class MockJSSocket implements MockJsWebSocket {
	binaryType = "blob";

	fig_id: number;
	readyState: number;
	onopen?: (() => void);
	onmessage?: ((message: { data: unknown; }) => void);
	messageTarget?: { postMessage(message: unknown, options?: WindowPostMessageOptions): void };

	constructor(fig_id: number) {
		this.fig_id = fig_id;
		this.readyState = 0;
	}

	open(): void {
		this.readyState = 1;
		this.onopen?.();
	}

	_receive_binary(content: string | ArrayBuffer) {
		const buffer = typeof content == 'string' ? (url => {
			const data = atob(url.split(',')[1]);
			const buf = new Uint8Array(data.length);
			for(let i = 0; i < data.length; i++) buf[i] = data.charCodeAt(i);
			return buf.buffer;
		})(content) : content;
		const data = new Blob([buffer]);
		this.onmessage?.({ data });
	}

	_receive_json(data: string) {
		this.onmessage?.({ data });
	}

	send(content: unknown): void {
		this.messageTarget?.postMessage({
			type: 'matplotlibResponse',
			id: this.fig_id,
			message: JSON.stringify(content),
		} satisfies M2WMessage);
	}
}
