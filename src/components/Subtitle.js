import React from 'react';
import styled from 'styled-components';
import toastr from 'toastr';
import { checkTime, timeToSecond, escapeHTML, unescapeHTML } from '../utils';
import { Table } from 'react-virtualized';

const Wrapper = styled.div`
    flex: 1;
    border-right: 1px solid rgb(36, 41, 45);
    .ReactVirtualized__Table {
        font-size: 13px;
        background: #24292d;

        .ReactVirtualized__Table__Grid {
            outline: none;
        }

        .ReactVirtualized__Table__headerRow {
            background: #1c2022;
            border-bottom: 1px solid rgb(36, 41, 45);

            .row {
                padding: 10px 5px;
                font-style: normal;
                font-weight: normal;
                font-size: 14px;
                text-align: center;
                text-transform: none;
            }
        }

        .ReactVirtualized__Table__row {
            background-color: #1c2022;
            border-bottom: 1px solid rgb(36, 41, 45);
            transition: all 0.2s ease;

            &.odd {
                background-color: #2e3140;
            }

            &.highlight {
                background-color: #2196f3;
            }

            &.overlapping,
            &.reverse {
                background-color: #c75123;
            }

            .row {
                padding: 10px 5px;
                text-align: center;
            }
        }

        .input,
        .textarea {
            border: none;
            padding: 5px;
            min-height: 30px;
            font-size: 13px;
            color: #fff;
            background-color: #3a3a3a;
        }

        .textarea {
            resize: vertical;
        }

        p {
            line-height: 1.5;
            margin: 0;
        }
    }

    .operation {
        display: flex;
        justify-content: center;

        i {
            width: 30px;
            cursor: pointer;
            font-size: 16px;
        }
    }

    .edit {
        display: none;
        width: 100%;
        height: 100%;
    }

    .editing {
        .noedit {
            display: none;
        }

        .edit {
            display: block;
        }
    }
`;

export default class Subtitle extends React.Component {
    state = {
        lastCurrentIndex: -1,
        editIndex: -1,
        editSubtitle: {},
        $table: this.$table,
    };

    static getDerivedStateFromProps(props, state) {
        if (props.currentIndex !== state.lastCurrentIndex) {
            const $subtitle = document.querySelector('.ReactVirtualized__Grid__innerScrollContainer .onhighlight');
            if ($subtitle) {
                document.querySelector('.ReactVirtualized__Table__Grid').scrollTop = $subtitle.offsetTop;
            }
        }

        return {
            lastCurrentIndex: props.currentIndex,
        };
    }

    checkSubtitle() {
        const { editIndex, editSubtitle } = this.state;
        const { subtitles } = this.props;
        if (editIndex !== -1) {
            if (!checkTime(editSubtitle.start)) {
                toastr.error(`Start time format needs to match like: [00:00:00.000]`);
                return false;
            }

            if (!checkTime(editSubtitle.end)) {
                toastr.error(`End time format needs to match like: [00:00:00.000]`);
                return false;
            }

            if (timeToSecond(editSubtitle.start) >= timeToSecond(editSubtitle.end)) {
                toastr.error(`Start time cannot be greater than or equal to the end time`);
                return false;
            }

            if (subtitles[editIndex - 1] && timeToSecond(editSubtitle.start) < subtitles[editIndex - 1].endTime) {
                toastr.warning(`This time overlaps with the time of the previous one`);
            }
        }
        return true;
    }

    onEdit(index) {
        if (this.checkSubtitle()) {
            this.setState({
                editIndex: index,
                editSubtitle: {
                    ...this.props.subtitles[index],
                },
            });
            this.props.editSubtitle(index);
        }
    }

    onUpdate() {
        if (this.checkSubtitle()) {
            const { editIndex, editSubtitle } = this.state;
            this.props.updateSubtitle(editIndex, {
                ...editSubtitle,
            });
            this.setState({
                editIndex: -1,
                editSubtitle: {},
            });
        }
    }

    onChange(name, value) {
        this.setState({
            editSubtitle: {
                ...this.state.editSubtitle,
                [name]: value,
            },
        });
    }

    onRemove(index) {
        this.props.removeSubtitle(index);
        this.setState({
            editIndex: -1,
            editSubtitle: {},
        });
    }

    render() {
        const { subtitles, mainHeight, mainWidth } = this.props;
        const { editSubtitle, lastCurrentIndex } = this.state;
        return (
            <Wrapper>
                <Table
                    headerHeight={40}
                    width={mainWidth / 2}
                    height={mainHeight}
                    rowHeight={60}
                    scrollToIndex={lastCurrentIndex}
                    rowCount={subtitles.length}
                    rowGetter={({ index }) => subtitles[index]}
                    headerRowRenderer={() => {
                        return (
                            <div className="ReactVirtualized__Table__headerRow">
                                <div className="row" style={{ width: 50 }} width="50">
                                    #
                                </div>
                                <div className="row" style={{ width: 100 }} width="120">
                                    Start
                                </div>
                                <div className="row" style={{ width: 100 }} width="120">
                                    End
                                </div>
                                <div className="row" style={{ width: 100 }} width="100">
                                    Duration
                                </div>
                                <div className="row" style={{ flex: 1 }}>
                                    Text
                                </div>
                                <div className="row" style={{ width: 100 }} width="100">
                                    Operation
                                </div>
                            </div>
                        );
                    }}
                    rowRenderer={props => {
                        return (
                            <div
                                key={props.key}
                                className={[
                                    props.className,
                                    props.index % 2 ? 'odd' : '',
                                    props.rowData.editing ? 'editing' : '',
                                    props.rowData.highlight ? 'highlight' : '',
                                    props.rowData.overlapping ? 'overlapping' : '',
                                    props.rowData.reverse ? 'reverse' : '',
                                ]
                                    .join(' ')
                                    .trim()}
                                style={props.style}
                            >
                                <div className="row" style={{ width: 50 }}>
                                    {props.index + 1}
                                </div>
                                <div className="row" style={{ width: 100 }}>
                                    <span className="noedit">{props.rowData.start}</span>
                                    <input
                                        maxLength={20}
                                        className="input edit"
                                        defaultValue={editSubtitle.start}
                                        onChange={e => this.onChange('start', e.target.value)}
                                    />
                                </div>
                                <div className="row" style={{ width: 100 }}>
                                    <span className="noedit">{props.rowData.end}</span>
                                    <input
                                        maxLength={20}
                                        className="input edit"
                                        defaultValue={editSubtitle.end}
                                        onChange={e => this.onChange('end', e.target.value)}
                                    />
                                </div>
                                <div className="row" style={{ width: 100 }}>
                                    <span className="noedit">{props.rowData.duration}</span>
                                    <input
                                        disabled
                                        maxLength={20}
                                        className="input edit"
                                        defaultValue={editSubtitle.duration}
                                        onChange={e => this.onChange('duration', e.target.value)}
                                    />
                                </div>
                                <div className="row" style={{ flex: 1 }}>
                                    <span className="noedit">
                                        {props.rowData.text.split(/\r?\n/).map((item, index) => (
                                            <p key={index}>{escapeHTML(item)}</p>
                                        ))}
                                    </span>
                                    <textarea
                                        maxLength={500}
                                        className="textarea edit"
                                        value={unescapeHTML(editSubtitle.text || '')}
                                        onChange={e => this.onChange('text', e.target.value)}
                                    />
                                </div>
                                <div className="row operation" style={{ width: 100 }}>
                                    <i className="icon-pencil noedit" onClick={() => this.onEdit(props.index)}></i>
                                    <i className="icon-ok edit" onClick={() => this.onUpdate(props.index)}></i>
                                    <i className="icon-trash-empty" onClick={() => this.onRemove(props.index)}></i>
                                </div>
                            </div>
                        );
                    }}
                ></Table>
            </Wrapper>
        );
    }
}
