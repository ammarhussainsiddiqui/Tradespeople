import React from 'react'

const Copyright = () => {
    return (
        <div className="">
            <div className="flex md:my-2 flex-col md:flex-row justify-between text-center text-muted-foreground w-full">
                <p className='truncate w-full text-center text-sm' >© Copyright {new Date().getFullYear()}. All Rights Reserved</p>
            </div>
        </div>
    )
}

export default Copyright