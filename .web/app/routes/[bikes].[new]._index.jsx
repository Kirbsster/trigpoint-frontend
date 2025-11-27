import {Fragment,useCallback,useContext,useEffect,useRef} from "react"
import {EventLoopContext,StateContexts,UploadFilesContext} from "$/utils/context"
import {ReflexEvent,isNotNullOrUndefined,isTrue,refs} from "$/utils/state"
import {Box as RadixThemesBox,Button as RadixThemesButton,Card as RadixThemesCard,Flex as RadixThemesFlex,Heading as RadixThemesHeading,Text as RadixThemesText,TextField as RadixThemesTextField} from "@radix-ui/themes"
import DebounceInput from "react-debounce-input"
import {} from "react-dropzone"
import {useDropzone} from "react-dropzone"
import {jsx} from "@emotion/react"




function Debounceinput_30926342522fdddfaf34bc4a0a96dcec () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_5ee33e437501c1a1c38bcb72624d71ca = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___bike_state____bike_state.set_name", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_5ee33e437501c1a1c38bcb72624d71ca,placeholder:"e.g. Whyte T-130",value:(isNotNullOrUndefined(reflex___state____state__app___state___bike_state____bike_state.name_rx_state_) ? reflex___state____state__app___state___bike_state____bike_state.name_rx_state_ : "")},)
  )
}


function Debounceinput_83f3c1749b11585a39747458f37ded4b () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_0b5b0aaf155d194e564e479d1ee0beab = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___bike_state____bike_state.set_brand", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_0b5b0aaf155d194e564e479d1ee0beab,placeholder:"e.g. Whyte",value:(isNotNullOrUndefined(reflex___state____state__app___state___bike_state____bike_state.brand_rx_state_) ? reflex___state____state__app___state___bike_state____bike_state.brand_rx_state_ : "")},)
  )
}


function Debounceinput_a31193ebf0c4c7620a327922ce6b9f24 () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_99ded5b35c7025185ea44c3f611e0f07 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___bike_state____bike_state.set_model_year", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_99ded5b35c7025185ea44c3f611e0f07,placeholder:"e.g. 2019",value:(isNotNullOrUndefined(reflex___state____state__app___state___bike_state____bike_state.model_year_rx_state_) ? reflex___state____state__app___state___bike_state____bike_state.model_year_rx_state_ : "")},)
  )
}


function Comp_c2d32d330b13681ea1e47af1182c4e81 () {
  const ref_bike_hero_upload = useRef(null); refs["ref_bike_hero_upload"] = ref_bike_hero_upload;
const [addEvents, connectErrors] = useContext(EventLoopContext);
const [filesById, setFilesById] = useContext(UploadFilesContext);
const on_drop_7e1250cba2646ffda12b2ab801b31805 = useCallback(e => setFilesById(filesById => {
    const updatedFilesById = Object.assign({}, filesById);
    updatedFilesById["bike-hero-upload"] = e;
    return updatedFilesById;
  })
    , [addEvents, ReflexEvent, filesById, setFilesById])
const on_drop_rejected_2fcedbdc0771e7617b4270e2d1ac8cc9 = useCallback(((_ev_0) => (addEvents([(ReflexEvent("_call_function", ({ ["function"] : (() => (refs['__toast']?.["error"]("", ({ ["title"] : "Files not Accepted", ["description"] : _ev_0.map(((osizayzf) => (osizayzf?.["file"]?.["path"]+": "+osizayzf?.["errors"].map(((wnkiegyk) => wnkiegyk?.["message"])).join(", ")))).join("\n\n"), ["closeButton"] : true, ["style"] : ({ ["whiteSpace"] : "pre-line" }) })))), ["callback"] : null }), ({  })))], [_ev_0], ({  })))), [addEvents, ReflexEvent])
const { getRootProps: xdvxrcsn, getInputProps: udaxihhe, isDragActive: bacghqta} = useDropzone(({ ["maxFiles"] : 1, ["accept"] : ["image/*"], ["multiple"] : true, ["id"] : "bike-hero-upload", ["onDrop"] : on_drop_7e1250cba2646ffda12b2ab801b31805, ["onDropRejected"] : on_drop_rejected_2fcedbdc0771e7617b4270e2d1ac8cc9 }));



  return (
    jsx(Fragment,{},jsx(RadixThemesBox,{className:"rx-Upload",css:({ ["border"] : "1px dashed var(--accent-12)", ["padding"] : "5em", ["textAlign"] : "center" }),id:"bike-hero-upload",ref:ref_bike_hero_upload,...xdvxrcsn()},jsx("input",{type:"file",...udaxihhe()},),jsx(RadixThemesBox,{css:({ ["border"] : "1px dashed #888", ["padding"] : "1rem", ["borderRadius"] : "0.5rem", ["textAlign"] : "center", ["width"] : "100%" })},"Click or drag an image here")))
  )
}


function Fragment_8ea58f94136cc2df5d407ee9df18a69d () {
  const [filesById, setFilesById] = useContext(UploadFilesContext);



  return (
    jsx(Fragment,{},(!(((filesById["bike-hero-upload"] ? filesById["bike-hero-upload"].map((f) => f.name) : [])?.valueOf?.() === []?.valueOf?.()))?(jsx(Fragment,{},jsx(RadixThemesText,{as:"p",size:"2"},"File selected"))):(jsx(Fragment,{},))))
  )
}


function Text_66c079d8c1159a72b02b2961f378b420 () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)



  return (
    jsx(RadixThemesText,{as:"p",css:({ ["color"] : "red" })},reflex___state____state__app___state___bike_state____bike_state.message_rx_state_)
  )
}


function Fragment_3079a1292be83b46f5493f26a73f08e2 () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)



  return (
    jsx(Fragment,{},(!((reflex___state____state__app___state___bike_state____bike_state.message_rx_state_?.valueOf?.() === ""?.valueOf?.()))?(jsx(Fragment,{},jsx(Text_66c079d8c1159a72b02b2961f378b420,{},))):(jsx(Fragment,{},))))
  )
}


function Button_bd0c143650414da97cf1f8797739cc75 () {
  const [filesById, setFilesById] = useContext(UploadFilesContext);
const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_a69e829e7031207af6359bc1628b3c3c = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___bike_state____bike_state.save_bike", ({ ["files"] : filesById?.["bike-hero-upload"], ["upload_id"] : "bike-hero-upload", ["extra_headers"] : ({  }) }), ({  }), "uploadFiles"))], [_e], ({  })))), [addEvents, ReflexEvent, filesById, setFilesById])

  return (
    jsx(RadixThemesButton,{loading:reflex___state____state__app___state___bike_state____bike_state.loading_rx_state_,onClick:on_click_a69e829e7031207af6359bc1628b3c3c},"Save bike")
  )
}


function Fragment_118f6ea0fcb26908dc7bc75dbe791ffe () {
  const reflex___state____state__app___state___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___state___auth_state____auth_state)



  return (
    jsx(Fragment,{},(isTrue(reflex___state____state__app___state___auth_state____auth_state.access_token_rx_state_)?(jsx(Fragment,{},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["width"] : "100%", ["height"] : "100%" })},jsx(RadixThemesCard,{css:({ ["maxWidth"] : "480px", ["width"] : "100%" })},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"4"},jsx(RadixThemesHeading,{size:"6"},"Add a bike"),jsx(RadixThemesText,{as:"p",size:"3"},"Enter basic details for this bike."),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"1"},jsx(RadixThemesText,{as:"p",size:"3"},"Name"),jsx(Debounceinput_30926342522fdddfaf34bc4a0a96dcec,{},)),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"1"},jsx(RadixThemesText,{as:"p",size:"3"},"Brand"),jsx(Debounceinput_83f3c1749b11585a39747458f37ded4b,{},)),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"1"},jsx(RadixThemesText,{as:"p",size:"3"},"Model year"),jsx(Debounceinput_a31193ebf0c4c7620a327922ce6b9f24,{},)),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"1"},jsx(RadixThemesText,{as:"p",size:"3"},"Hero image (optional)"),jsx(Comp_c2d32d330b13681ea1e47af1182c4e81,{},)),jsx(Fragment_8ea58f94136cc2df5d407ee9df18a69d,{},),jsx(Fragment_3079a1292be83b46f5493f26a73f08e2,{},),jsx(Button_bd0c143650414da97cf1f8797739cc75,{},)))))):(jsx(Fragment,{},jsx(RadixThemesBox,{},)))))
  )
}


export default function Component() {





  return (
    jsx(Fragment,{},jsx(Fragment_118f6ea0fcb26908dc7bc75dbe791ffe,{},),jsx("title",{},"Add bike"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}