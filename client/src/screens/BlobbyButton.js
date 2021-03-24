function BlobbyButton()
{
    return(
        <>
            <span className="inner">
                <span className="blobs">
                    <span className="blob"></span>
                    <span className="blob"></span>
                    <span className="blob"></span>
                    <span className="blob"></span>
                </span>
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10"></feGaussianBlur>
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 21 -7"
                            result="goo"></feColorMatrix>
                        <feBlend in2="goo" in="SourceGraphic" result="mix"></feBlend>
                    </filter>
                </defs>
            </svg>
        </>
    )
}

export default BlobbyButton;