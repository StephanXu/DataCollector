from absl import app, flags, logging
from utils import delay
from apis import NetworkAPI
from script_operation import ScriptOperation
import os

FLAGS = flags.FLAGS
flags.DEFINE_string('server', 'http://127.0.0.1:8080/api/', 'Backend host.')
flags.DEFINE_string('spectra-output-dir',
                    'C:\\Lumex\\SpectraLUMPro\\Results\\Spectra',
                    'spectra output directory.')
flags.DEFINE_string('output-dir',
                    'C:\\Users\\lorime\\Desktop\\SPoutput\\',
                    'output directory.')
flags.DEFINE_string('base-dir',
                    'C:\\Users\\lorime\\Downloads\\RoboticArm\\assets-2021', 'base directory.')

spectra_output_dir = ''
output_dir = ''


def scan_sample(sop: ScriptOperation, sample_id: int):
    logging.info(f'Scan sample {sample_id} ...')
    sop.click_pic('sample.bmp', 25, 28)
    sop.keypress(8, repeat=10)
    sop.keypress(46, repeat=10)
    sop.input_by_clipboard(f'sample-{sample_id}')
    sop.click_pic('sample.bmp', 0, 0)
    original_filelist = os.listdir(spectra_output_dir)
    is_started = False
    while not is_started:
        sop.click_pic("start.bmp", 0, 0, post_delay=1000)
        sop.dm.MoveTo(20, 20)
        is_started = 'find' == sop.wait_pic('measure.bmp', 10)
    delay(1000)
    sop.dm.MoveTo(20, 20)
    sop.wait_pic('save_alert.bmp', 120)
    delay(1000)
    sop.click_pic("save_alert.bmp", 116, 142)
    sop.wait_pic("start.bmp", 1000)

    output_filenames = list(
        set(os.listdir(spectra_output_dir)).difference(set(original_filelist)))
    if len(output_filenames) == 0:
        raise Exception('Can not find output file.')
    result_file = output_filenames[0]
    logging.info(f'Save result file: {result_file}')

    return result_file


def main(argv):
    global spectra_output_dir
    global output_dir
    del argv
    api = NetworkAPI(FLAGS.server)
    sop = ScriptOperation(FLAGS.get_flag_value('base-dir',None))
    spectra_output_dir = FLAGS.get_flag_value('spectra-output-dir', None)
    output_dir = FLAGS.get_flag_value('output-dir', None)
    logging.info('Start in 3s...')
    delay(3000)
    logging.info('Begin to receive tasks.')
    while True:
        sop.click(20, 20)
        tasks = api.fetch_new_tasks()
        if len(tasks) == 0:
            continue
        logging.info(f'Received {len(tasks)} tasks.')
        for task in tasks:
            result_file = scan_sample(sop, task['sampleId'])
            with open(os.path.join(spectra_output_dir, result_file), 'r') as res_file:
                content = res_file.read()
                with open(os.path.join(output_dir, f'sample-{task["sampleId"]}.spa'), 'w') as cpy_file:
                    cpy_file.write(content)
                submit_res = api.submit_result(task['id'],
                                               result_file,
                                               content)
                if submit_res['msg'] == 'ok':
                    logging.info(f'Submit sample {task["sampleId"]} success')
                else:
                    logging.error(f'Submit sample {task["sampleId"]} failed')
        delay(1000)


if __name__ == '__main__':
    app.run(main)
