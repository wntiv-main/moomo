export interface AsyncResult<T, E> extends Promise<T> {
	then<_T = T, _E = E>(onfulfilled?: ((value: T) => _T | PromiseLike<_T>) | null | undefined, onrejected?: ((reason: E) => _E | PromiseLike<_E>) | null | undefined): Promise<_T | _E>;
	catch<_E = never>(onrejected?: ((reason: E) => _E | PromiseLike<_E>) | null | undefined): Promise<T | _E>;
	finally(onfinally?: (() => void) | null | undefined): AsyncResult<T, E>;
	[Symbol.toStringTag]: string;
}
