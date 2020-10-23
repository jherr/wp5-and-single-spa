import React from "react";


const InputText = ( {states} ) => {
    const { primary, secondary } = states;
    const [primaryToken, setPrimaryToken] = primary;
    const [secondaryToken, setSecondaryToken] = secondary;
    return <><input onChange={(e)=>setPrimaryToken(e.target.value)} value={primaryToken} />
    <input onChange={(e)=>setSecondaryToken(e.target.value)} value={secondaryToken}/></>;
}

export default InputText;
