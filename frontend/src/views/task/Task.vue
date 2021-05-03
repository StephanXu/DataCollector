<template>
  <v-container>
    <v-row>
      <v-col md="4">
        <div class="mb-4 ms-2">
          <h1>{{ detecting ? "正在检测" : "新任务" }}</h1>
          <span class="text-subtitle-1">创建新任务</span>
        </div>
        <v-form :disabled="detecting" style="max-width: 750px">
          <v-card class="mb-4 rounded-xl" outlined>
            <v-card-text>
              <v-text-field
                label="样本编号"
                v-model.number="newTaskForm.sampleId"
              ></v-text-field>
            </v-card-text>
          </v-card>
          <v-card
            class="mb-4 rounded-xl"
            v-for="(value, idx) in newTaskForm.pigment"
            :key="idx"
            outlined
          >
            <v-card-text>
              <v-text-field
                label="色素名称"
                v-model="newTaskForm.pigment[idx]"
                placeholder="色素名称"
              ></v-text-field>
              <v-text-field
                label="阶段色素质量(g)"
                v-model.number="newTaskForm.stagePigmentWeight[idx]"
                :rules="[
                  (v) =>
                    !!v && idx == 0
                      ? true
                      : (newTaskForm.stagePigmentWeight[idx] -
                          newTaskForm.stagePigmentWeight[idx - 1] >
                        0
                          ? true
                          : false) || '此处色素质量不对',
                ]"
              ></v-text-field>
            </v-card-text>
            <v-card-actions class="mt-n6">
              <v-spacer />
              <v-btn
                depressed
                small
                color="error"
                rounded
                @click="deletePigment(idx)"
                :disabled="newTaskForm.pigment.length == 1 || detecting"
              >
                <v-icon left>mdi-minus</v-icon>Remove
              </v-btn>
            </v-card-actions>
          </v-card>
          <v-btn
            depressed
            rounded
            block
            @click="addPigment()"
            :disabled="detecting"
          >
            <v-icon left>mdi-plus</v-icon>Add pigment
          </v-btn>
          <v-card class="my-4 rounded-xl" outlined>
            <v-card-text>
              <v-text-field
                label="样本质量(g)"
                v-model.number="newTaskForm.sampleWeight"
                :rules="[
                  (v) =>
                    (!!v &&
                      newTaskForm.sampleWeight >
                        newTaskForm.stagePigmentWeight[
                          newTaskForm.stagePigmentWeight.length - 1
                        ]) ||
                    '此处样本质量不对',
                ]"
              ></v-text-field>
            </v-card-text>
          </v-card>
          <v-btn
            depressed
            color="primary"
            :loading="detecting || loading"
            @click="addTask"
            large
            block
            rounded
            ><v-icon left>mdi-send</v-icon>Send
          </v-btn>
        </v-form>
      </v-col>
      <v-col md="8">
        <div class="mb-4 ms-2">
          <h1>任务列表</h1>
          <span class="text-subtitle-1">所有任务</span>
        </div>
        <v-card outlined class="rounded-xl">
          <v-data-table
            :items="tasks"
            :headers="taskListHeaders"
            item-key="sampleId"
            sort-by="addTime"
            :sort-desc="true"
          >
            <template v-slot:[`item.addTime`]="{ item }">
              {{ new Date(item.addTime).toLocaleString() }}
            </template>
            <template v-slot:[`item.finishTime`]="{ item }">
              {{
                item.status === "finished"
                  ? new Date(item.finishTime).toLocaleString()
                  : "未完成"
              }}
            </template>
            <template v-slot:[`item.status`]="{ item }">
              {{ item.status === "unfinished" ? "进行中" : "完成" }}
            </template>
            <template v-slot:[`item.resultFilename`]="{ item }">
              {{ item.status === "finished" ? item.resultFilename : "不可用" }}
            </template>
            <template v-slot:[`item.operation`]="{ item }">
              <v-btn icon @click="editTask(item)" color="primary">
                <v-icon>mdi-square-edit-outline</v-icon>
              </v-btn>
              <v-btn icon color="primary">
                <v-icon>mdi-chart-bell-curve</v-icon>
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
import Big from "big.js";

class NewTaskForm {
  sampleId = 0;
  pigment: string[] = [""];
  stagePigmentWeight: number[] = [0];
  sampleWeight = 0;
}

@Component
export default class TaskView extends Vue {
  private newTaskForm = new NewTaskForm();

  private tasks: Task[] = [];
  private detecting = false;
  private loading = false;

  private taskListHeaders = [
    { text: "样本编号", value: "sampleId" },
    { text: "色素种类", value: "pigment[]" },
    { text: "阶段色素质量(g)", value: "pigmentWeight[]" },
    { text: "样本质量(g)", value: "sampleWeight" },
    { text: "结果文件", value: "resultFilename" },
    { text: "添加时间", value: "addTime" },
    { text: "完成时间", value: "finishTime" },
    { text: "任务状态", value: "status" },
    { text: "操作", value: "operation" },
  ];

  public async addTask() {
    this.loading = true;
    const taskReq: AddTaskRequest = {
      sampleId: this.newTaskForm.sampleId,
      pigment: this.newTaskForm.pigment,
      pigmentWeight: this.newTaskForm.stagePigmentWeight.map((val, idx, arr) =>
        Big(val)
          .sub(arr.slice(0, idx).reduce((a, b) => Big(a).add(b).toNumber(), 0))
          .toNumber()
      ),
      sampleWeight: this.newTaskForm.sampleWeight,
    };
    await addTask(taskReq);
    this.detecting = true;
    this.loading = false;
  }

  public async refreshTask() {
    this.tasks = await fetchTask();
  }

  public async syncUnifinishedTask() {
    const t = await fetchUnfinishedTask();
    if (t.length > 0) {
      this.detecting = true;
      this.newTaskForm.sampleId = t[0].sampleId;
      this.newTaskForm.pigment = t[0].pigment;
      (this.newTaskForm.stagePigmentWeight = t[0].pigmentWeight.map(
        (val, idx, arr) =>
          Big(val)
            .add(
              arr.slice(0, idx).reduce((a, b) => Big(a).add(b).toNumber(), 0)
            )
            .toNumber()
      )),
        (this.newTaskForm.sampleWeight = t[0].sampleWeight);
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
    return;
  }

  @Watch("detecting")
  async onDetectingChange(val: boolean, oldVal: boolean) {
    if (val != oldVal) {
      await this.refreshTask();
    }
    if (!val && oldVal && this.tasks.length > 0) {
      const sorted = this.tasks.sort((a, b) => b.sampleId - a.sampleId);
      this.newTaskForm.sampleId = sorted[0].sampleId + 1;
      this.newTaskForm.pigment = sorted[0].pigment;
    }
  }

  public addPigment() {
    this.newTaskForm.pigment.push("");
    this.newTaskForm.stagePigmentWeight.push(0);
  }

  public deletePigment(idx: number) {
    if (idx >= this.newTaskForm.pigment.length) {
      return;
    }
    this.newTaskForm.pigment.splice(idx, 1);
    this.newTaskForm.stagePigmentWeight.splice(idx, 1);
  }
}
</script>

<style>
</style>
