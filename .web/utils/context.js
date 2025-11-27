import { createContext, useContext, useMemo, useReducer, useState, createElement, useEffect } from "react"
import { applyDelta, ReflexEvent, hydrateClientStorage, useEventLoop, refs } from "$/utils/state"
import { jsx } from "@emotion/react";

export const initialState = {"reflex___state____state": {"bike_id_rx_state_": "", "is_hydrated_rx_state_": false, "router_rx_state_": {"session": {"client_token": "", "client_ip": "", "session_id": ""}, "headers": {"host": "", "origin": "", "upgrade": "", "connection": "", "cookie": "", "pragma": "", "cache_control": "", "user_agent": "", "sec_websocket_version": "", "sec_websocket_key": "", "sec_websocket_extensions": "", "accept_encoding": "", "accept_language": "", "raw_headers": {}}, "page": {"host": "", "path": "", "raw_path": "", "full_path": "", "full_raw_path": "", "params": {}}, "url": "", "route_id": ""}}, "reflex___state____state.app___state___auth_state____auth_state": {"access_token_rx_state_": "", "email_rx_state_": "", "is_verified_rx_state_": null, "just_verified_rx_state_": false, "loading_rx_state_": false, "me_email_rx_state_": null, "me_role_rx_state_": null, "message_rx_state_": "", "new_password_rx_state_": null, "new_password2_rx_state_": null, "password_rx_state_": "", "password2_rx_state_": "", "refresh_token_rx_state_": null, "remember_me_rx_state_": false, "reset_token_rx_state_": null, "verify_success_rx_state_": false}, "reflex___state____state.app___state___bike_state____bike_state": {"bikes_rx_state_": [], "brand_rx_state_": "", "current_bike_rx_state_": {}, "has_bikes_rx_state_": false, "loading_rx_state_": true, "message_rx_state_": "", "model_year_rx_state_": "", "name_rx_state_": ""}, "reflex___state____state.app___state___mouse_state____mouse_state": {"debug_xy_rx_state_": "x=0, y=0, js_calls=0", "js_calls_rx_state_": 0, "pointer_x_rx_state_": 0, "pointer_y_rx_state_": 0}, "reflex___state____state.app___state___page_state____page_state": {"loading_rx_state_": false, "loading_message_rx_state_": "Loading…"}, "reflex___state____state.app___state___shed_state____shed_state": {"description_rx_state_": "", "has_sheds_rx_state_": false, "loading_rx_state_": true, "message_rx_state_": "", "name_rx_state_": "", "sheds_rx_state_": [], "visibility_rx_state_": "private"}, "reflex___state____state.app___state___sidebar_state____sidebar_state": {"arrow_rotation_rx_state_": "rotate(180deg)", "open_rx_state_": false, "sidebar_width_rx_state_": "0px"}, "reflex___state____state.reflex___state____frontend_event_exception_state": {}, "reflex___state____state.reflex___state____on_load_internal_state": {}, "reflex___state____state.reflex___state____update_vars_internal_state": {}}

export const defaultColorMode = "system"
export const ColorModeContext = createContext(null);
export const UploadFilesContext = createContext(null);
export const DispatchContext = createContext(null);
export const StateContexts = {reflex___state____state: createContext(null),reflex___state____state__app___state___auth_state____auth_state: createContext(null),reflex___state____state__app___state___bike_state____bike_state: createContext(null),reflex___state____state__app___state___mouse_state____mouse_state: createContext(null),reflex___state____state__app___state___page_state____page_state: createContext(null),reflex___state____state__app___state___shed_state____shed_state: createContext(null),reflex___state____state__app___state___sidebar_state____sidebar_state: createContext(null),reflex___state____state__reflex___state____frontend_event_exception_state: createContext(null),reflex___state____state__reflex___state____on_load_internal_state: createContext(null),reflex___state____state__reflex___state____update_vars_internal_state: createContext(null),};
export const EventLoopContext = createContext(null);
export const clientStorage = {"cookies": {}, "local_storage": {"reflex___state____state.app___state___auth_state____auth_state.access_token_rx_state_": {"sync": true}}, "session_storage": {}}


export const state_name = "reflex___state____state"

export const exception_state_name = "reflex___state____state.reflex___state____frontend_event_exception_state"

// These events are triggered on initial load and each page navigation.
export const onLoadInternalEvent = () => {
    const internal_events = [];

    // Get tracked cookie and local storage vars to send to the backend.
    const client_storage_vars = hydrateClientStorage(clientStorage);
    // But only send the vars if any are actually set in the browser.
    if (client_storage_vars && Object.keys(client_storage_vars).length !== 0) {
        internal_events.push(
            ReflexEvent(
                'reflex___state____state.reflex___state____update_vars_internal_state.update_vars_internal',
                {vars: client_storage_vars},
            ),
        );
    }

    // `on_load_internal` triggers the correct on_load event(s) for the current page.
    // If the page does not define any on_load event, this will just set `is_hydrated = true`.
    internal_events.push(ReflexEvent('reflex___state____state.reflex___state____on_load_internal_state.on_load_internal'));

    return internal_events;
}

// The following events are sent when the websocket connects or reconnects.
export const initialEvents = () => [
    ReflexEvent('reflex___state____state.hydrate'),
    ...onLoadInternalEvent()
]
    

export const isDevMode = true;

export function UploadFilesProvider({ children }) {
  const [filesById, setFilesById] = useState({})
  refs["__clear_selected_files"] = (id) => setFilesById(filesById => {
    const newFilesById = {...filesById}
    delete newFilesById[id]
    return newFilesById
  })
  return createElement(
    UploadFilesContext.Provider,
    { value: [filesById, setFilesById] },
    children
  );
}

export function ClientSide(component) {
  return ({ children, ...props }) => {
    const [Component, setComponent] = useState(null);
    useEffect(() => {
      setComponent(component);
    }, []);
    return Component ? jsx(Component, props, children) : null;
  };
}

export function EventLoopProvider({ children }) {
  const dispatch = useContext(DispatchContext)
  const [addEvents, connectErrors] = useEventLoop(
    dispatch,
    initialEvents,
    clientStorage,
  )
  return createElement(
    EventLoopContext.Provider,
    { value: [addEvents, connectErrors] },
    children
  );
}

export function StateProvider({ children }) {
  const [reflex___state____state, dispatch_reflex___state____state] = useReducer(applyDelta, initialState["reflex___state____state"])
const [reflex___state____state__app___state___auth_state____auth_state, dispatch_reflex___state____state__app___state___auth_state____auth_state] = useReducer(applyDelta, initialState["reflex___state____state.app___state___auth_state____auth_state"])
const [reflex___state____state__app___state___bike_state____bike_state, dispatch_reflex___state____state__app___state___bike_state____bike_state] = useReducer(applyDelta, initialState["reflex___state____state.app___state___bike_state____bike_state"])
const [reflex___state____state__app___state___mouse_state____mouse_state, dispatch_reflex___state____state__app___state___mouse_state____mouse_state] = useReducer(applyDelta, initialState["reflex___state____state.app___state___mouse_state____mouse_state"])
const [reflex___state____state__app___state___page_state____page_state, dispatch_reflex___state____state__app___state___page_state____page_state] = useReducer(applyDelta, initialState["reflex___state____state.app___state___page_state____page_state"])
const [reflex___state____state__app___state___shed_state____shed_state, dispatch_reflex___state____state__app___state___shed_state____shed_state] = useReducer(applyDelta, initialState["reflex___state____state.app___state___shed_state____shed_state"])
const [reflex___state____state__app___state___sidebar_state____sidebar_state, dispatch_reflex___state____state__app___state___sidebar_state____sidebar_state] = useReducer(applyDelta, initialState["reflex___state____state.app___state___sidebar_state____sidebar_state"])
const [reflex___state____state__reflex___state____frontend_event_exception_state, dispatch_reflex___state____state__reflex___state____frontend_event_exception_state] = useReducer(applyDelta, initialState["reflex___state____state.reflex___state____frontend_event_exception_state"])
const [reflex___state____state__reflex___state____on_load_internal_state, dispatch_reflex___state____state__reflex___state____on_load_internal_state] = useReducer(applyDelta, initialState["reflex___state____state.reflex___state____on_load_internal_state"])
const [reflex___state____state__reflex___state____update_vars_internal_state, dispatch_reflex___state____state__reflex___state____update_vars_internal_state] = useReducer(applyDelta, initialState["reflex___state____state.reflex___state____update_vars_internal_state"])
  const dispatchers = useMemo(() => {
    return {
      "reflex___state____state": dispatch_reflex___state____state,
"reflex___state____state.app___state___auth_state____auth_state": dispatch_reflex___state____state__app___state___auth_state____auth_state,
"reflex___state____state.app___state___bike_state____bike_state": dispatch_reflex___state____state__app___state___bike_state____bike_state,
"reflex___state____state.app___state___mouse_state____mouse_state": dispatch_reflex___state____state__app___state___mouse_state____mouse_state,
"reflex___state____state.app___state___page_state____page_state": dispatch_reflex___state____state__app___state___page_state____page_state,
"reflex___state____state.app___state___shed_state____shed_state": dispatch_reflex___state____state__app___state___shed_state____shed_state,
"reflex___state____state.app___state___sidebar_state____sidebar_state": dispatch_reflex___state____state__app___state___sidebar_state____sidebar_state,
"reflex___state____state.reflex___state____frontend_event_exception_state": dispatch_reflex___state____state__reflex___state____frontend_event_exception_state,
"reflex___state____state.reflex___state____on_load_internal_state": dispatch_reflex___state____state__reflex___state____on_load_internal_state,
"reflex___state____state.reflex___state____update_vars_internal_state": dispatch_reflex___state____state__reflex___state____update_vars_internal_state,
    }
  }, [])

  return (
    createElement(StateContexts.reflex___state____state,{value: reflex___state____state},
createElement(StateContexts.reflex___state____state__app___state___auth_state____auth_state,{value: reflex___state____state__app___state___auth_state____auth_state},
createElement(StateContexts.reflex___state____state__app___state___bike_state____bike_state,{value: reflex___state____state__app___state___bike_state____bike_state},
createElement(StateContexts.reflex___state____state__app___state___mouse_state____mouse_state,{value: reflex___state____state__app___state___mouse_state____mouse_state},
createElement(StateContexts.reflex___state____state__app___state___page_state____page_state,{value: reflex___state____state__app___state___page_state____page_state},
createElement(StateContexts.reflex___state____state__app___state___shed_state____shed_state,{value: reflex___state____state__app___state___shed_state____shed_state},
createElement(StateContexts.reflex___state____state__app___state___sidebar_state____sidebar_state,{value: reflex___state____state__app___state___sidebar_state____sidebar_state},
createElement(StateContexts.reflex___state____state__reflex___state____frontend_event_exception_state,{value: reflex___state____state__reflex___state____frontend_event_exception_state},
createElement(StateContexts.reflex___state____state__reflex___state____on_load_internal_state,{value: reflex___state____state__reflex___state____on_load_internal_state},
createElement(StateContexts.reflex___state____state__reflex___state____update_vars_internal_state,{value: reflex___state____state__reflex___state____update_vars_internal_state},
    createElement(DispatchContext, {value: dispatchers}, children)
    ))))))))))
  )
}