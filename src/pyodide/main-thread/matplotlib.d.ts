import { TypeToConstructor } from "../../util";

export interface MockJsWebSocket {
    binaryType: string;

	fig_id: number;
	readyState: number;

	onopen?: () => void;

    open(): void;

	onmessage?: (message: { data: unknown }) => void;

    send(content: unknown): void;
}

class Figure {
	id: number;
	ws: MockJsWebSocket;
	supports_binary: boolean;

	imageObj: HTMLImageElement;
	
	context: CanvasRenderingContext2D | undefined;
	message: HTMLElement | undefined;
	canvas: HTMLCanvasElement | undefined;
	rubberband_canvas: HTMLCanvasElement | undefined;
	rubberband_context: CanvasRenderingContext2D | undefined;
	format_dropdown: HTMLSelectElement | undefined;

	image_mode: 'full' | string;
	
	root: HTMLElement;

	_toolbar_images: HTMLImageElement[];
	
	waiting: boolean;

	ResizeObserver?: typeof ResizeObserver;
	resizeObserverInstance?: ResizeObserver;

	buttons?: Record<string, HTMLButtonElement>;

	constructor(figure_id: number, websocket: MockJsWebSocket, ondownload: unknown, parent_element: HTMLElement);

	_init_header(): void;
	_canvas_extra_style(_canvas_div: HTMLElement): void;
	_root_extra_style(_canvas_div: HTMLElement): void;
	_init_canvas(): void;

	_resize_canvas?(width: number, height: number, forward: boolean): void;

	_init_toolbar(): void;

	request_resize(x_pixels: number, y_pixels: number): void;
	send_message(type: string, properties: unknown & object): void;
	send_draw_message(): void;

	handle_save(fig: Figure, _msg: unknown): void;
	handle_resize(fig: Figure, msg: { size: [number, number], forward: boolean }): void;
	handle_rubberband(fig: Figure, msg: { x0: number, x1: number, y0: number, y1: number }): void;
	handle_figure_label(fig: Figure, msg: { label: string }): void;
	handle_cursor(fig: Figure, msg: { cursor: string }): void;
	handle_message(fig: Figure, msg: { message: string }): void;
	handle_draw(fig: Figure, _msg: unknown & object): void;
	handle_image_mode(fig: Figure, msg: { mode: string }): void;
	handle_history_buttons(fig: Figure, msg: Record<string, boolean>): void;
	handle_navigate_mode(fig: Figure, msg: { mode: 'PAN' | 'ZOOM' | string | undefined }): void;

	updated_canvas_event(): void;
	_make_on_message_function(fig: Figure): NonNullable<MockJsWebSocket['onmessage']>;
}

export interface MPL {
	get_websocket_type(): TypeToConstructor<MockJsWebSocket, [number]>,
	figure: typeof Figure,
}
