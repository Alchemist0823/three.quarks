import * as React from "react";


interface FileInputProps {
    fileName: string
    onChange: (files: FileList) => void;
}

export class FileInput extends React.Component<FileInputProps>
{
    constructor(props: any)
    {
        super(props);
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files)
            this.props.onChange(e.target.files);
    };

    render ()
    {
        return <div>
            <input type="file" onChange={this.handleChange} />
            {this.props.fileName}
        </div>;
    }
}