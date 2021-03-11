<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card flat outlined>
          <v-card-title>{{ detecting ? "正在检测" : "新任务" }}</v-card-title>
          <v-divider />
          <v-card-text>
            <v-form :disabled="detecting">
              <v-row>
                <v-col cols="12" md="2">
                  <v-text-field
                    label="样本编号"
                    v-model.number="newTask.sampleId"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="2">
                  <v-text-field
                    label="色素名称"
                    v-model="newTask.pigment"
                    placeholder="色素名称"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="2">
                  <v-text-field
                    label="色素质量(g)"
                    v-model.number="newTask.pigmentWeight"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="2">
                  <v-text-field
                    label="样本质量(g)"
                    v-model.number="newTask.sampleWeight"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="2">
                  <v-text-field
                    label="色素浓度"
                    v-model.number="concentration"
                    disabled
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="2">
                  <v-btn
                    depressed
                    color="primary"
                    :loading="detecting | loading"
                    @click="addTask"
                    large
                    style="width: 100%"
                    ><v-icon left>mdi-send</v-icon>发送</v-btn
                  >
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card outlined>
          <v-data-table
            :items="tasks"
            :headers="taskListHeaders"
            item-key="sampleId"
          >
            <template v-slot:item.addTime="{ item }">
              {{ new Date(item.addTime).toLocaleString() }}
            </template>
            <template v-slot:item.finishTime="{ item }">
              {{
                item.status === "finished"
                  ? new Date(item.finishTime).toLocaleString()
                  : "未完成"
              }}
            </template>
            <template v-slot:item.status="{ item }">
              {{ item.status === "unfinished" ? "进行中" : "完成" }}
            </template>
            <template v-slot:item.resultFilename="{ item }">
              {{ item.status === "finished" ? item.resultFilename : "不可用" }}
            </template>
            <template v-slot:item.operation="{ item }">
              <v-btn text @click="editTask(item)" color="primary">
                <v-icon left>mdi-square-edit-outline</v-icon>编辑
              </v-btn>
              <v-btn text color="primary">
                <v-icon left>mdi-chart-bell-curve</v-icon>曲线
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import {
  addTask,
  AddTaskRequest,
  fetchTask,
  fetchUnfinishedTask,
  Task,
} from "@/api/task";
@Component
export default class TaskView extends Vue {
  private newTask = new AddTaskRequest();
  private tasks: Task[] = [];
  private detecting = false;
  private loading = false;

  private taskListHeaders = [
    { text: "样本编号", value: "sampleId" },
    { text: "色素种类", value: "pigment" },
    { text: "色素质量(g)", value: "pigmentWeight" },
    { text: "样本质量(g)", value: "sampleWeight" },
    { text: "结果文件", value: "resultFilename" },
    { text: "添加时间", value: "addTime" },
    { text: "完成时间", value: "finishTime" },
    { text: "任务状态", value: "status" },
    { text: "操作", value: "operation" },
  ];

  public async addTask() {
    this.loading = true;
    await addTask(this.newTask);
    this.detecting = true;
    this.loading = false;
  }

  public async refreshTask() {
    this.tasks = await fetchTask();
    console.log(await fetchTask());
  }

  public async syncUnifinishedTask() {
    const t = await fetchUnfinishedTask();
    if (t.length > 0) {
      this.detecting = true;
      this.newTask.sampleId = t[0].sampleId;
      this.newTask.pigment = t[0].pigment;
      this.newTask.pigmentWeight = t[0].pigmentWeight;
      this.newTask.sampleWeight = t[0].sampleWeight;
    } else {
      this.detecting = false;
    }
  }

  public async created() {
    await this.syncUnifinishedTask();
    await this.refreshTask();
    setInterval(this.syncUnifinishedTask, 1000);
  }

  public async editTask(item: Task) {
    console.log(item);
  }

  get concentration() {
    if (this.newTask.sampleWeight == 0) {
      return "不可用";
    }
    return this.newTask.pigmentWeight / this.newTask.sampleWeight;
  }

  @Watch("detecting")
  onDetectingChange(val: boolean, oldVal: boolean) {
    if (val != oldVal) {
      this.refreshTask();
    }
  }
}
</script>

<style scoped></style>
