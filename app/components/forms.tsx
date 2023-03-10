import {
	createContext,
	forwardRef,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	type ForwardedRef,
	type HTMLProps,
	type ReactNode,
} from "react";
import { json } from "@remix-run/server-runtime";
import {
	Form,
	type FetcherWithComponents,
	type FormProps,
} from "@remix-run/react";
import { type ZodError, type ZodFormattedError } from "zod";

export function createErrorResponse(
	error: ZodError,
	restorableFields: string[],
	formData: FormData,
	status: number = 400
) {
	const restorableFieldSet = new Set(restorableFields);

	const restorable: [string, string][] = [];
	for (const [field, value] of formData.entries()) {
		if (restorableFieldSet.has(field) && typeof value == "string") {
			restorable.push([field, value]);
		}
	}

	return json(
		{
			errors: error.format(),
			restorable,
		},
		status
	);
}

function createStorageKey(form: HTMLFormElement) {
	return `draft:${form.id || form.action}:${form.method}`;
}

export function discardDraft(form: HTMLFormElement | null | undefined) {
	if (!form) return;

	const storageKey = createStorageKey(form);
	localStorage.removeItem(storageKey);
}

const FormContext = createContext<{
	errors?: ZodFormattedError<any>;
	restoredFormData?: URLSearchParams;
}>({});

function DraftFormImp(
	{
		onChange: _onChange,
		errors,
		fetcher,
		restorable,
		children,
		...rest
	}: FormProps & {
		fetcher?: FetcherWithComponents<any>;
		errors?: ZodFormattedError<any>;
		restorable?: [string, string][];
	},
	forwardedRef: ForwardedRef<HTMLFormElement>
) {
	const restoredFormData = useMemo(() => {
		const formData = new URLSearchParams();
		if (!restorable) return;
		for (const [field, value] of restorable) {
			formData.append(field, value);
		}
		return formData;
	}, [restorable]);

	const ref = useRef<HTMLFormElement | null>(null);
	const refCallback = useCallback(
		(form: HTMLFormElement | null) => {
			switch (typeof forwardedRef) {
				case "function":
					forwardedRef(form);
					break;
				case "object":
					if (forwardedRef) {
						forwardedRef.current = form;
					}
					break;
			}

			ref.current = form;
		},
		[forwardedRef]
	);

	const timeoutRef = useRef<number | NodeJS.Timeout | null>(null);
	const onChange = useCallback<NonNullable<typeof _onChange>>(
		(event) => {
			if (_onChange) {
				_onChange(event);
			}
			if (event.defaultPrevented) {
				return;
			}

			if (timeoutRef.current !== null) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}

			timeoutRef.current = setTimeout(() => {
				const form = ref.current;
				if (!form) return;

				const formData = new FormData(form);

				const toSave = Array.from(formData.entries());
				const storageKey = createStorageKey(form);

				// TODO: Try catch this and surface error message to user
				localStorage.setItem(storageKey, JSON.stringify(toSave));
			}, 200);
		},
		[ref, _onChange]
	);

	useEffect(() => {
		const form = ref.current;
		if (!form) return;

		const storageKey = createStorageKey(form);
		const draft = localStorage.getItem(storageKey);
		if (draft) {
			const entries = JSON.parse(draft);
			for (const [name, value] of entries) {
				const input = form.elements.namedItem(name);
				if (input instanceof HTMLInputElement) {
					if (input.type == "checkbox") {
						input.checked = value == "true";
					} else if (input.type == "radio") {
						if (input.value == value) {
							input.checked = true;
						}
					} else {
						input.value = value;
					}
				} else if (input instanceof HTMLTextAreaElement) {
					input.value = value;
				} else if (input instanceof HTMLSelectElement) {
					input.value = value;
				}
			}
		}
	}, [ref]);

	const FormComp = fetcher ? fetcher.Form : Form;

	return (
		<FormContext.Provider
			value={{
				errors: errors as ZodFormattedError<{}>,
				restoredFormData,
			}}
		>
			<FormComp {...rest} onChange={onChange} ref={refCallback}>
				{children}
			</FormComp>
		</FormContext.Provider>
	);
}

export const DraftForm = forwardRef(DraftFormImp);

function TextInputImp(
	{
		id,
		name,
		defaultValue,
		children,
		...rest
	}: Omit<HTMLProps<HTMLInputElement>, "type"> & { children: ReactNode },
	forwardedRef: ForwardedRef<HTMLInputElement>
) {
	const { errors, restoredFormData } = useContext(FormContext);
	const error =
		name && errors
			? (errors as ZodFormattedError<{ [key: typeof name]: string }>)[name]
			: undefined;
	const restoredValue =
		restoredFormData && name ? restoredFormData.get(name) : undefined;
	const ariaLabeledBy = id && error ? `${id}-label` : undefined;

	return (
		<label htmlFor={id} className="block mb-3 last:mb-0">
			<span className="block text-sm font-medium leading-6 text-gray-900">
				{children}
			</span>
			<input
				type="text"
				{...rest}
				ref={forwardedRef}
				id={id}
				name={name}
				defaultValue={restoredValue || defaultValue}
				aria-labelledby={ariaLabeledBy}
				className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
			/>
			{error && error._errors && error._errors.length > 0 && (
				<ul
					id={ariaLabeledBy}
					className="text-sm text-red-600 dark:text-red-400"
				>
					{error._errors.map((error, index) => (
						<li key={index + error}>{error}</li>
					))}
				</ul>
			)}
		</label>
	);
}

export const TextInput = forwardRef(TextInputImp);

function NumberInputImp(
	{
		id,
		name,
		defaultValue,
		children,
		...rest
	}: Omit<HTMLProps<HTMLInputElement>, "type"> & { children: ReactNode },
	forwardedRef: ForwardedRef<HTMLInputElement>
) {
	const { errors, restoredFormData } = useContext(FormContext);
	const error =
		name && errors
			? (errors as ZodFormattedError<{ [key: typeof name]: string }>)[name]
			: undefined;
	const restoredValue =
		restoredFormData && name ? restoredFormData.get(name) : undefined;
	const ariaLabeledBy = id && error ? `${id}-label` : undefined;

	return (
		<label htmlFor={id} className="block mb-3 last:mb-0">
			<span className="block text-sm font-medium leading-6 text-gray-900">
				{children}
			</span>
			<input
				type="number"
				{...rest}
				ref={forwardedRef}
				id={id}
				name={name}
				defaultValue={restoredValue || defaultValue}
				aria-labelledby={ariaLabeledBy}
				className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
			/>
			{error && error._errors && error._errors.length > 0 && (
				<ul
					id={ariaLabeledBy}
					className="text-sm text-red-600 dark:text-red-400"
				>
					{error._errors.map((error, index) => (
						<li key={index + error}>{error}</li>
					))}
				</ul>
			)}
		</label>
	);
}

export const NumberInput = forwardRef(NumberInputImp);

function SelectImp(
	{
		id,
		name,
		header,
		defaultValue,
		children,
		...rest
	}: HTMLProps<HTMLSelectElement> & { children: ReactNode; header: ReactNode },
	forwardedRef: ForwardedRef<HTMLSelectElement>
) {
	const { errors, restoredFormData } = useContext(FormContext);
	const error =
		name && errors
			? (errors as ZodFormattedError<{ [key: typeof name]: string }>)[name]
			: undefined;
	const restoredValue =
		restoredFormData && name ? restoredFormData.get(name) : undefined;
	const ariaLabeledBy = id && error ? `${id}-label` : undefined;

	return (
		<label htmlFor={id} className="block mb-3 last:mb-0">
			<span className="block text-sm font-medium leading-6 text-gray-900">
				{header}
			</span>
			<select
				{...rest}
				ref={forwardedRef}
				id={id}
				name={name}
				defaultValue={restoredValue || defaultValue}
				aria-labelledby={ariaLabeledBy}
				className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm sm:leading-6"
			>
				{children}
			</select>
			{error && error._errors && error._errors.length > 0 && (
				<ul
					id={ariaLabeledBy}
					className="text-sm text-red-600 dark:text-red-400"
				>
					{error._errors.map((error, index) => (
						<li key={index + error}>{error}</li>
					))}
				</ul>
			)}
		</label>
	);
}

export const SelectInput = forwardRef(SelectImp);

function CheckBoxImpl(
	{
		id,
		name,
		defaultValue,
		children,
		...rest
	}: Omit<HTMLProps<HTMLInputElement>, "type"> & { children: ReactNode },
	forwardedRef: ForwardedRef<HTMLInputElement>
) {
	const { errors, restoredFormData } = useContext(FormContext);
	const error =
		name && errors
			? (errors as ZodFormattedError<{ [key: typeof name]: string }>)[name]
			: undefined;
	const restoredValue =
		restoredFormData && name ? restoredFormData.get(name) : undefined;
	const ariaLabeledBy = id && error ? `${id}-label` : undefined;

	return (
		<div className="relative flex items-start">
			<div className="flex h-6 items-center">
				<input
					type="checkbox"
					{...rest}
					ref={forwardedRef}
					id={id}
					name={name}
					defaultValue={restoredValue ?? defaultValue}
					aria-labelledby={ariaLabeledBy}
					className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
				/>
			</div>
			<div className="ml-3 text-sm leading-6">
				<label htmlFor={id} className="font-medium text-gray-900">
					{children}
				</label>
				{/* <p id="comments-description" className="text-gray-500">
						Get notified when someones posts a comment on a posting.
					</p> */}

				{error && error._errors && error._errors.length > 0 && (
					<ul
						id={ariaLabeledBy}
						className="text-sm text-red-600 dark:text-red-400"
					>
						{error._errors.map((error, index) => (
							<li key={index + error}>{error}</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}

export const CheckBox = forwardRef(CheckBoxImpl);

function DateInputImpl(
	{
		id,
		name,
		defaultValue,
		children,
		...rest
	}: Omit<HTMLProps<HTMLInputElement>, "type"> & { children: ReactNode },
	forwardedRef: ForwardedRef<HTMLInputElement>
) {
	const { errors, restoredFormData } = useContext(FormContext);
	const error =
		name && errors
			? (errors as ZodFormattedError<{ [key: typeof name]: string }>)[name]
			: undefined;
	const restoredValue =
		restoredFormData && name ? restoredFormData.get(name) : undefined;
	const ariaLabeledBy = id && error ? `${id}-label` : undefined;

	return (
		<label htmlFor={id} className="block mb-3 last:mb-0">
			<span className="block text-sm font-medium leading-6 text-gray-900">
				{children}
			</span>
			<input
				type="date"
				{...rest}
				ref={forwardedRef}
				id={id}
				name={name}
				defaultValue={restoredValue || defaultValue}
				aria-labelledby={ariaLabeledBy}
				className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
			/>
			{error && error._errors && error._errors.length > 0 && (
				<ul
					id={ariaLabeledBy}
					className="text-sm text-red-600 dark:text-red-400"
				>
					{error._errors.map((error, index) => (
						<li key={index + error}>{error}</li>
					))}
				</ul>
			)}
		</label>
	);
}

export const DateInput = forwardRef(DateInputImpl);
