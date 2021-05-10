import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

const dateFormat = (date: string, timeFormat: string) => {
  return format(new Date(date), timeFormat, {
    locale: ptBR,
  });
};

export default dateFormat;
