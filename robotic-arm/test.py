from absl import flags, app

FLAGS = flags.FLAGS
flags.DEFINE_string('hello-world', 'ok', 'nice')


def main(argv):
    del argv
    print(FLAGS.get_flag_value('hello-world',''))


if __name__ == '__main__':
    app.run(main)
