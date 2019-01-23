var vm = new Vue({
    el: '#app',
    data: {
        result_list: [],
        result_max_val: [],
        task_processing: false,
        show_range: [],

        input_si: '',
        input_tm: '',
        input_hm: '',
        input_pi: '',
        input_wt: '',

        change_id: '',
        change_si: '',
        change_tm: '',
        change_hm: '',
        change_pi: '',
        change_wt: '',

        compareList: [],

        showLen: 30,
    },
    computed: {
        startBtnClass: function () {
            return {
                'button': true,
                'mid_text': true,
                'button-pill': !this.task_processing,
                'button-action': !this.task_processing,
                'button-circle': this.task_processing,
                'button-caution': this.task_processing,
            }
        },

        table_item_style: function () {
            return function (item) {
                if (this.compareList.length == 0)
                    return {};
                if (this.compareList.find((val) => {
                        return val == item.toString();
                    })) {
                    return {
                        'data_selected': true,
                    };
                }
                return {};
            };
        },

        table_item_max_warning: function () {
            return function (item) {
                if (this.result_max_val.length != this.result_list.length) {
                    return {};
                }
                var max_val = this.result_max_val[eval(
                    item)];
                var level = (max_val);
                level = parseInt(level);
                if (level > 5) level = 5;
                if (level < 0) level = 0;
                return {
                    'data_warning_0': level == 0,
                    'data_warning_1': level == 1,
                    'data_warning_2': level == 2,
                    'data_warning_3': level == 3,
                    'data_warning_4': level == 4,
                    'data_warning_5': level == 5,
                };
            };
        }
    },
    methods: {

        show_edit_block: function (id) {
            $.ajaxSettings.async = false;
            var res;
            $.post('getlist.php', {
                sp: id,
                ln: this.showLen,
            }, function (result) {
                res = JSON.parse(result);
            });
            this.change_id = id;
            this.change_si = res[0][1];
            this.change_tm = res[0][4];
            this.change_hm = res[0][5];
            this.change_pi = res[0][6];
            this.change_wt = res[0][7]

            $('#donate_tip').modal('show');
        },
        edit_item: function (event) {
            $.ajaxSettings.async = true;
            $.post('edititem.php', {
                iid: this.change_id,
                si: this.change_si,
                tmp: this.change_tm,
                hm: this.change_hm,
                pi: this.change_pi,
                wt: this.change_wt
            }, function (result) {
                vm.get_all_results(true);
            });
        },

        refresh_max_value: function () {
            var ret_obj = [];
            $.ajaxSettings.async = true;
            $.post('getgraph.php', {
                ids: 'all',
                ln: this.showLen,
            }, function (result) {
                ret_obj = JSON.parse(result);
                var series_obj = [];
                vm.result_max_val = [];
                for (var i = 0; i < ret_obj.length; i++) {
                    var point = vm.getLastPoint(ret_obj[i][2]);
                    vm.result_max_val.push(point[1]);
                }
            });
        },

        get_all_results: function (async_flag) {
            $.ajaxSettings.async = async_flag;
            $.post('getlist.php', {
                sp: "all",
                ln: this.showLen,
            }, function (result) {
                var origin_ret = JSON.parse(result);

                for (var i = 0; i < origin_ret.length; i++) {
                    var c = eval(origin_ret[i][6]) / eval(origin_ret[i][7]) * 100000;
                    origin_ret[i].splice(8, 0, c.toFixed(8).toString());
                }

                var new_show_range = [eval(origin_ret[0][0]), eval(origin_ret[origin_ret.length - 1][0])];
                if (new_show_range != vm.show_range) {
                    if (vm.showLen < 100) {
                        vm.refresh_max_value();
                    }
                    vm.show_range = new_show_range;
                }

                vm.result_list = origin_ret;
            });
        },

        refresh_result_list: function () {
            this.get_all_results(true);
        },

        peek_task: function () {
            $.ajaxSettings.async = true;
            $.post('peektask.php', {}, function (result) {
                var task_status = result.split('|')[0];
                if (task_status === '0') {
                    vm.task_processing = false;
                } else {
                    vm.task_processing = true;
                }
            });
        },

        set_task: function () {
            if (this.task_processing) {
                return;
            }

            if (this.input_si.length <= 0 ||
                this.input_tm.length <= 0 ||
                this.input_hm.length <= 0 ||
                this.input_pi.length <= 0 ||
                this.input_wt.length <= 0) {
                alert('请输入样本信息');
                return;
            }

            $.ajaxSettings.async = false;
            ret = '';
            $.post('settask.php', {
                si: this.input_si,
                tmp: this.input_tm,
                hm: this.input_hm,
                pi: this.input_pi,
                wt: this.input_wt,
            }, function (result) {
                ret = result;
            });
            if (ret != '1') {
                alert('启动任务失败，错误信息：' + ret);
            } else {
                //success
                this.task_processing = true;
            }


        },

        control_btn: function (btn_id) {
            const {
                ipcRenderer
            } = require('electron');
            // ipcRenderer.on('asynchronous-reply', (event, arg) => {
            //     alert("web2" + arg);// prints "pong"  在electron中web page里的console方法不起作用，因此使用alert作为测试方法
            // })
            ipcRenderer.send('msg_control_btn', btn_id); // prints "pong"   
        },

        getLastPoint: function (encoded_data) {
            var origin_text = window.atob(encoded_data);
            var arr_lines = origin_text.split('\n');
            var txt = '';
            while (txt.trim().length <= 1) {
                txt = arr_lines.pop();
            }
            txt = txt.replace('e ', 'e+');
            var point = txt.split('\t');
            return [eval(point[0]), eval(point[1])];
        },

        getPoints: function (encoded_data) {
            var origin_text = window.atob(encoded_data);
            var arr_lines = origin_text.split('\n');
            while (arr_lines.shift().trim() != 'DATA' && arr_lines.length > 0);
            var points = [];
            for (var i = 0; i < arr_lines.length; i++) {
                if (arr_lines[i].trim().length <= 0)
                    continue;
                arr_lines[i] = arr_lines[i].replace('e ', 'e+');
                var tmp = arr_lines[i].split('\t');
                points.push([eval(tmp[0]), eval(tmp[1])]);
            }
            return points;
        },

        compareChart: function () {
            if (this.compareList.length <= 0)
                return;

            var ids_range = '(';
            for (var i = 0; i < this.compareList.length; i++) {
                ids_range += this.compareList[i] + ',';
            }
            ids_range = ids_range.substring(0, ids_range.length - 1);
            ids_range += ')';

            var ret_obj = [];
            $.ajaxSettings.async = true;
            $.post('getgraph.php', {
                ids: ids_range
            }, function (result) {
                ret_obj = JSON.parse(result);
                var series_obj = [];
                for (var i = 0; i < ret_obj.length; i++) {
                    series_obj.push({
                        name: ret_obj[i][1],
                        data: vm.getPoints(ret_obj[i][2]),
                    });
                }

                var charts = new Highcharts.chart({
                    rangeSelector: {
                        buttonTheme: {
                            display: 'none'
                        },
                        selected: 1,
                        inputEnabled: false,
                    },
                    chart: {
                        zoomType: 'xy',
                        renderTo: 'graph_container',
                        // reflow: true,
                        type: 'spline',
                        defaultSeriesType: 'spline',
                    },
                    credits: {
                        text: 'Developed by Stephan Xu', // 显示的文字
                        href: 'https://www.mrxzh.com', // 链接地址
                    },
                    title: {
                        text: "比较图",
                    },
                    subtitle: {
                        text: "",
                    },
                    xAxis: {
                        title: {
                            text: '波段'
                        },
                        type: 'linear',
                        labels: {
                            formatter: function () {
                                return this.value;
                            }
                        }
                    },
                    yAxis: {
                        type: 'linear',
                        title: {
                            text: '吸光率'
                        },
                    },
                    series: series_obj,
                    legend: {
                        layout: 'vertical',
                        align: 'left',
                        verticalAlign: 'top',
                        x: 100,
                        y: 70,
                        floating: true,
                        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) ||
                            '#FFFFFF',
                        borderWidth: 1
                    },
                    plotOptions: {
                        spline: {
                            marker: {
                                enabled: false,
                            }
                        },
                        series: {
                            showInLegend: true
                        },
                    },
                    exporting: {
                        enabled: true,
                    },
                });
                $('#graph_tip').modal('show');
            });


        },
    },
    created: function () {
        // this.peek_task();
        this.get_all_results(true);
        setInterval(this.refresh_result_list, 3000);
        setInterval(this.peek_task, 3000);
    }
});