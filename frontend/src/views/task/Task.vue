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
                <v-col>
                  <v-text-field
                    label="样本编号"
                    v-model.number="newTask.sampleId"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-card
                class="mb-4"
                flat
                v-for="(value, idx) in newTask.pigment"
                :key="idx"
              >
                <v-divider />
                <v-row>
                  <v-col md="5">
                    <v-text-field
                      label="色素名称"
                      v-model="newTask.pigment[idx]"
                      placeholder="色素名称"
                    ></v-text-field>
                  </v-col>
                  <v-col md="5">
                    <v-text-field
                      label="阶段色素质量(g)"
                      v-model.number="newTask.stagePigmentWeight[idx]"
                    ></v-text-field>
                  </v-col>
                  <v-col md="2">
                    <v-btn
                      depressed
                      color="error"
                      text
                      large
                      @click="deletePigment(idx)"
                    >
                      <v-icon left>mdi-minus</v-icon>移除
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card>
              <v-row>
                <v-col>
                  <v-btn
                    depressed
                    color="primary"
                    large
                    style="width: 100%"
                    @click="addPigment()"
                  >
                    添加新色素</v-btn
                  >
                </v-col>
              </v-row>
              <v-text-field
                label="样本质量(g)"
                v-model.number="newTask.sampleWeight"
              ></v-text-field>
              <v-btn
                depressed
                color="primary"
                :loading="detecting || loading"
                @click="addTask"
                large
                style="width: 100%"
                ><v-icon left>mdi-send</v-icon>发送</v-btn
              >
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

// class NewTaskForm {
//   stagePigmentWeight: number[] = [];
// }

@Component
export default class TaskView extends Vue {
  private newTask: AddTaskRequest = {
    sampleId: 0,
    pigment: [],
    stagePigmentWeight: [],
    sampleWeight: 0,
  };

  // private newTaskForm: NewTaskForm = {
  //   stagePigmentWeight: [],
  // };

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
    this.calculateStagePigmentWeight();
    // console.log(this.newTaskForm.stagePigmentWeight);
    console.log(this.newTask.pigment);
    await addTask(this.newTask);
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
      this.newTask.sampleId = t[0].sampleId;
      this.newTask.pigment = t[0].pigment;
      this.newTask.stagePigmentWeight = t[0].stagePigmentWeight;
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
    const concentration: number[] = [];

    for (let i = 0; i < this.newTask.stagePigmentWeight.length; i++) {
      if (this.newTask.stagePigmentWeight[i] == 0) {
        return "不可用";
      }
      concentration.push(
        Number(this.newTask.stagePigmentWeight[i]) /
          this.newTask.stagePigmentWeight[i]
      );
    }
    return concentration;
  }

  @Watch("detecting")
  async onDetectingChange(val: boolean, oldVal: boolean) {
    if (val != oldVal) {
      await this.refreshTask();
    }
    if (!val && oldVal && this.tasks.length > 0) {
      const sorted = this.tasks.sort((a, b) => b.sampleId - a.sampleId);
      this.newTask.sampleId = sorted[0].sampleId + 1;
      this.newTask.pigment = sorted[0].pigment;
    }
  }

  //新增色素
  public addPigment() {
    this.newTask.pigment.push(" ");
    this.newTask.stagePigmentWeight.push(0);
  }

  //删除色素
  public deletePigment(idx: any) {
    this.newTask.pigment.splice(idx, 1);
    this.newTask.stagePigmentWeight.splice(idx, 1);
  }

  //计算阶段色素质量
  public calculateStagePigmentWeight() {
    for(let idx = 1; idx < this.newTask.stagePigmentWeight.length; idx++) {
      this.newTask.stagePigmentWeight[idx] - this.newTask.stagePigmentWeight[idx-1];
      console.log(this.newTask.stagePigmentWeight);
      // this.newTask.stagePigmentWeight[idx] = 
    }
  }
}
</script>

<style scoped></style>
