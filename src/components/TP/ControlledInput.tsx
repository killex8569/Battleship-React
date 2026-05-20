import { useState } from'react';
const ControlledInput = () => {
    const [value, setValue] = useState('');
    return (
        <div>
            <input
                type=
                    "text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <p>Vous avez tapé : {value}</p>
        </div>
    );
};
export default ControlledInput;