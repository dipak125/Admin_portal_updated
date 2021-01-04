// ************ Developed By: Sumanta ************
// ********** Last Modified By: Sumanta **********

import React from "react";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import { Link } from "react-router-dom";


const LinkWithTooltip = ({ id, children, href, tooltip, clicked }) => {
   return (
       <OverlayTrigger
           overlay={<Tooltip id={id}>{tooltip}</Tooltip>}
           placement="top"
           delayShow={300}
           delayHide={150}
           trigger={['hover','focus']}
       >
           <Link to={href} onClick={clicked}>
           {children}
           </Link>
       </OverlayTrigger>
   );
}

export default LinkWithTooltip;